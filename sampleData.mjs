import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import './config.mjs'; // Loads .env variables
import { User, Sport, Event } from './db.mjs';

// --- Data for Generation ---
const firstNames = ['Alice', 'Bob', 'Clara', 'David', 'Eva', 'Finn', 'Grace', 'Henry', 'Ivy', 'Jack'];
const lastNames = ['Johnson', 'Smith', 'Lee', 'Brown', 'Green', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
const sportNames = ['Football', 'Basketball', 'Running', 'Table Tennis', 'Volleyball', 'Swimming', 'Cycling', 'Yoga'];
const locations = [
  'Central City Park', 'Riverside Pitch', 'Urban Court District', 'Community Center',
  'Hilltop Trail', 'Main Street Gym', 'Lakeview Rec Area', 'Northside Sports Hall'
];
const eventTitles = [
  'Morning', 'Afternoon', 'Evening', 'Weekly', 'Friendly', 'Competitive', 'Charity', 'Beginner'
];

// --- Helper Functions ---

/**
 * Picks random participants from the list of saved users.
 * @param {Array<User>} allUsers - The array of all saved user documents.
 * @param {number} num - The number of participants to pick.
 * @param {string} [excludeId] - A user ID to exclude (e.g., the owner).
 * @returns {Array<object>} An array of participant objects for the event schema.
 */
const getRandomParticipants = (allUsers, num, excludeId = null) => {
  const possibleParticipants = excludeId
    ? allUsers.filter(u => !u._id.equals(excludeId))
    : [...allUsers];

  const shuffled = possibleParticipants.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(num, shuffled.length)); // Ensure we don't take more than available

  return selected.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    image: null // Assuming no image for seeds
  }));
};

/**
 * Selects a random item from an array.
 * @param {Array<T>} arr
 * @returns {T}
 */
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Main Seeding Function ---

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.DNS);
    console.log("Connected to MongoDB for seeding...");

    // 2. Clear existing data
    await User.deleteMany({});
    await Sport.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared old data.");

    // 3. Create 10 sample users
    const passwordHash = bcrypt.hashSync('password123', 10);
    const usersToCreate = [];
    for (let i = 0; i < 10; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      usersToCreate.push({
        name: { firstName, secondName: lastName },
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        email: `${firstName.toLowerCase()}@example.com`,
        password: passwordHash,
        createdEvents: [], // Will be populated later
        joinedEvents: []   // Will be populated later
      });
    }

    const savedUsers = await User.insertMany(usersToCreate);
    console.log(`Created ${savedUsers.length} sample users.`);

    // 4. Create sample sports
    const sportsToCreate = sportNames.map(name => ({ name }));
    const savedSports = await Sport.insertMany(sportsToCreate);
    console.log(`Created ${savedSports.length} sample sports.`);

    // 5. Generate 100 sample events and track relationships
    console.log("Generating 100 events...");
    const eventsToCreate = [];
    
    // Maps to track which events each user created or joined
    // Key: userId (string), Value: Array of eventIds
    const userCreatedMap = new Map(savedUsers.map(u => [u._id.toString(), []]));
    const userJoinedMap = new Map(savedUsers.map(u => [u._id.toString(), []]));

    for (let i = 0; i < 100; i++) {
      const owner = getRandomItem(savedUsers);
      const sport = getRandomItem(savedSports);
      const title = `${getRandomItem(eventTitles)} ${sport.name} #${i + 1}`;
      
      // Get 1-8 participants, excluding the owner
      const numParticipants = Math.floor(Math.random() * 8) + 1;
      const participants = getRandomParticipants(savedUsers, numParticipants, owner._id);
      
      const eventDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
      const slots = numParticipants + Math.floor(Math.random() * 10) + 5; // 5-15 more slots than participants

      // Create an event document *in memory* (new Event() adds an _id)
      const eventDoc = new Event({
        title: title,
        description: `Join us for ${title}! A fun event at ${getRandomItem(locations)}.`,
        sport: sport._id,
        location: getRandomItem(locations),
        date: eventDate,
        time: `${Math.floor(Math.random() * 12) + 8}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        fee: Math.floor(Math.random() * 50),
        slots: slots,
        requirements: "Bring water and appropriate gear.",
        owner: owner._id,
        participants: participants
      });

      eventsToCreate.push(eventDoc);

      // Track the relationships to update users later
      userCreatedMap.get(owner._id.toString()).push(eventDoc._id);
      
      for (const p of participants) {
        userJoinedMap.get(p._id.toString()).push(eventDoc._id);
      }
    }

    // 6. Insert all events in one batch
    await Event.insertMany(eventsToCreate);
    console.log(`Seeded ${eventsToCreate.length} sample events.`);

    // 7. Update all users with their created/joined events
    console.log("Updating user references (createdEvents/joinedEvents)...");
    const bulkUserOps = [];

    for (const user of savedUsers) {
      const userIdStr = user._id.toString();
      const created = userCreatedMap.get(userIdStr);
      const joined = userJoinedMap.get(userIdStr);

      if (created.length > 0 || joined.length > 0) {
        bulkUserOps.push({
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: { // Use $set to replace the empty arrays
                createdEvents: created,
                joinedEvents: joined
              }
            }
          }
        });
      }
    }

    if (bulkUserOps.length > 0) {
      await User.bulkWrite(bulkUserOps);
      console.log(`Updated ${bulkUserOps.length} users with event relationships.`);
    }

    console.log("\n✅ Database seeding complete!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Run the seeder
seedDatabase();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import './config.mjs'; // Loads .env variables
import { User, Sport, Event } from './db.mjs';

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

    // 3. Create sample users
    const passwordHash = bcrypt.hashSync('password123', 10);

    const users = [
      { name: { firstName: 'Alice', secondName: 'Johnson' }, username: 'alicej', email: 'alice@example.com', password: passwordHash },
      { name: { firstName: 'Bob', secondName: 'Smith' }, username: 'bobsmith', email: 'bob@example.com', password: passwordHash },
      { name: { firstName: 'Clara', secondName: 'Lee' }, username: 'claralee', email: 'clara@example.com', password: passwordHash },
      { name: { firstName: 'David', secondName: 'Brown' }, username: 'davidb', email: 'david@example.com', password: passwordHash },
      { name: { firstName: 'Eva', secondName: 'Green' }, username: 'evag', email: 'eva@example.com', password: passwordHash }
    ];

    const savedUsers = await User.insertMany(users);
    console.log("Created sample users.");

    // 4. Create sample sports
    const sports = [
      { name: 'Football' },
      { name: 'Basketball' },
      { name: 'Running' },
      { name: 'Table Tennis' },
      { name: 'Volleyball' }
    ];

    const savedSports = await Sport.insertMany(sports);
    console.log("Created sample sports.");

    // Helper to pick random users
    const getRandomParticipants = (num) => {
      const shuffled = [...savedUsers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num).map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: null
      }));
    };

    // 5. Create sample events
    const events = [
      {
        title: "Sunday Morning Marathon",
        description: "Join us for a refreshing 10k run through the city park. All levels welcome!",
        sport: savedSports.find(s => s.name === 'Running')._id,
        location: "Central City Park, Main Entrance",
        date: new Date("2025-11-16T08:00:00Z"),
        time: "08:00 AM",
        fee: 15,
        slots: 10,
        requirements: "Running shoes, water bottle, and a positive attitude!",
        owner: savedUsers[0]._id, // Alice
        participants: getRandomParticipants(6)
      },
      {
        title: "Saturday Morning Soccer",
        description: "Casual soccer game for all skill levels.",
        sport: savedSports.find(s => s.name === 'Football')._id,
        location: "Riverside Pitch",
        date: new Date("2025-11-23T08:30:00Z"),
        time: "08:30 AM",
        fee: 3,
        slots: 14,
        requirements: "Soccer shoes, shin guards.",
        owner: savedUsers[1]._id, // Bob
        participants: getRandomParticipants(5)
      },
      {
        title: "3v3 Street Basketball",
        description: "Competitive street basketball match.",
        sport: savedSports.find(s => s.name === 'Basketball')._id,
        location: "Urban Court District",
        date: new Date("2025-11-23T17:00:00Z"),
        time: "05:00 PM",
        fee: 0,
        slots: 6,
        requirements: "Basketball shoes.",
        owner: savedUsers[2]._id, // Clara
        participants: getRandomParticipants(4)
      }
    ];

    await Event.insertMany(events);
    console.log("Seeded sample events with participants linked to users.");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Run the seeder
seedDatabase();

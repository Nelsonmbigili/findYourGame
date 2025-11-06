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

    // 3. Create a Test User (owner for the events)
    const hash = bcrypt.hashSync('testpass123', 10);
    const seedUser = await new User({
      name: { firstName: 'Seed', secondName: 'User' },
      username: 'testuser',
      email: 'test@example.com',
      password: hash,
    }).save();

    // 4. Create Test Sports
    const sportFootball = await new Sport({ name: 'Football' }).save();
    const sportBasketball = await new Sport({ name: 'Basketball' }).save();
    const sportTennis = await new Sport({ name: 'Tennis' }).save();
    const sportCycling = await new Sport({ name: 'Cycling' }).save();
    const sportRunning = await new Sport({ name: 'Running' }).save();
    const sportTableTennis = await new Sport({ name: 'Table Tennis' }).save();
    const sportVolleyball = await new Sport({ name: 'Volleyball' }).save();
    const sportBoxing = await new Sport({ name: 'Boxing' }).save();
    const sportYoga = await new Sport({ name: 'Yoga' }).save();
    const sportBadminton = await new Sport({ name: 'Badminton' }).save();
    const sportPickleball = await new Sport({ name: 'Pickleball' }).save();


    console.log("Created test user and sports.");

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};


    // 5. Create Test Events
    const eventsToSeed = [

  {
    title: "Saturday Morning Soccer",
    sport: sportFootball._id,
    location: "Riverside Pitch",
    date: new Date("2025-11-23T08:30:00"),
    time: "08:30 AM",
    fee: 3,
    slots: 14,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "3v3 Street Basketball",
    sport: sportBasketball._id,
    location: "Urban Court District",
    date: new Date("2025-11-23T17:00:00"),
    time: "05:00 PM",
    fee: 0,
    slots: 6,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Morning Jog & Stretch",
    sport: sportRunning._id,
    location: "City Park Loop",
    date: new Date("2025-11-24T07:00:00"),
    time: "07:00 AM",
    fee: 0,
    slots: 30,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Table Tennis Friendly",
    sport: sportTableTennis._id,
    location: "Youth Center",
    date: new Date("2025-11-24T15:00:00"),
    time: "03:00 PM",
    fee: 1,
    slots: 8,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Beach Volleyball Meetup",
    sport: sportVolleyball._id,
    location: "North Beach Court",
    date: new Date("2025-11-25T16:00:00"),
    time: "04:00 PM",
    fee: 0,
    slots: 8,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Boxing Fitness Session",
    sport: sportBoxing._id,
    location: "Power Fitness Gym",
    date: new Date("2025-11-26T18:30:00"),
    time: "06:30 PM",
    fee: 4,
    slots: 10,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Yoga in the Park",
    sport: sportYoga._id,
    location: "Lakeside Gardens",
    date: new Date("2025-11-27T07:30:00"),
    time: "07:30 AM",
    fee: 2,
    slots: 25,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Badminton Duo Challenge",
    sport: sportBadminton._id,
    location: "Indoor Sports Arena",
    date: new Date("2025-11-27T14:00:00"),
    time: "02:00 PM",
    fee: 2,
    slots: 6,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Community Fun Run",
    sport: sportRunning._id,
    location: "Seaside Boulevard",
    date: new Date("2025-11-28T08:00:00"),
    time: "08:00 AM",
    fee: 0,
    slots: 50,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Evening Pickleball Match",
    sport: sportPickleball._id,
    location: "Recreation Center Court B",
    date: new Date("2025-11-28T18:00:00"),
    time: "06:00 PM",
    fee: 1,
    slots: 8,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Saturday Morning Soccer",
    sport: sportFootball._id,
    location: "Riverside Pitch",
    date: addDays(2), // 2 days from today
    time: "08:30 AM",
    fee: 3,
    slots: 14,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "3v3 Street Basketball",
    sport: sportBasketball._id,
    location: "Urban Court District",
    date: addDays(3),
    time: "05:00 PM",
    fee: 0,
    slots: 6,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Morning Jog & Stretch",
    sport: sportRunning._id,
    location: "City Park Loop",
    date: addDays(4),
    time: "07:00 AM",
    fee: 0,
    slots: 30,
    owner: seedUser._id,
    participants: []
  },
  {
    title: "Table Tennis Friendly",
    sport: sportTableTennis._id,
    location: "Youth Center",
    date: addDays(5),
    time: "03:00 PM",
    fee: 1,
    slots: 8,
    owner: seedUser._id,
    participants: []
  }
];

    await Event.insertMany(eventsToSeed);
    console.log("Successfully seeded events!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // 6. Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Run the seeder function
seedDatabase();

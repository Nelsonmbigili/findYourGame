import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect(process.env.DNS)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


// Schemas
const userSchema = new mongoose.Schema({
  name: {
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
  },
  username: { type: String, required: true },
  email: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  password: { 
    type: String, 
    required: function() {
      return !this.googleId;
    },
    select: false 
  },
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Arr of Reference to obj 
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Arr of Reference to obj 
  createdAt: { type: Date, default: Date.now }
});


const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  location: { type: String, required: true },  
  date: { type: Date, required: true },
  time: { type: String, required: true },
  fee: { type: Number, default: 0 },
  slots: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to obj
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Arr of Reference to obj
  createdAt: { type: Date, default: Date.now }
});


const sportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String }, 
  equipment: [{ type: String }] 
});

// Models

export const User = mongoose.model('User', userSchema);
export const Event = mongoose.model('Event', eventSchema);
export const Sport = mongoose.model('Sport', sportSchema);

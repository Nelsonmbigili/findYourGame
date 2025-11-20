import {Event, Sport, User} from './db.mjs'; 

const formatEvents = (events) => {
  if (!Array.isArray(events)) {events = [events];} 
  
  return events.map(event => {
    const dateObj = new Date(event.date);
    const optionsDate = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
      ...event,
      formattedDate: dateObj.toLocaleDateString('en-US', optionsDate),
      formattedTime: dateObj.toLocaleTimeString('en-US', optionsTime),
      slotsRemaining: event.slots - (event.participants?.length || 0)
    };
  });
};

export const getSearchResults = async (query, sort = { date: 1 }, skip = 0, limit = 10) => {
  return await Event.find(query)
    .populate('sport', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

export const getSportsOptions = async () =>{
   const sports = await Sport.find()
                    .lean();
   const options = sports.map(sport => ({ value: sport.name, label: sport.name }));
   return options;
};

export const getOptionsFromEvents = async (optionName) =>{
   const optionsArray = await Event.distinct(optionName);
   const options = optionsArray.map(option => ({ value: option, label: option }));
   return options;
};

export const getSportIdByName = async (sportName) => {
  const sport = await Sport.findOne({ name: sportName }).lean();
  return sport?._id || null;
};

export const getEventById = async (id) => {
  const event = await Event.findOne({ _id: id })
    .populate('sport')           
    .populate('owner', 'name email') 
    .populate('participants', 'name email image') 
    .lean();

  return formatEvents(event)[0];
};

export const getUserById = async (id) => {
  const user = await User.findOne({ _id: id })
    .select('-password -resetToken -resetTokenExpiry')
    .lean();

  return user;
};

export const getUserByUserName = async (username) => {
  const user = await User.findOne({ username: username})
    .select('-password -resetToken -resetTokenExpiry')
    .lean();

  return user;
};

export const getEventsCount = async (query = {}) => {

  return await Event.countDocuments(query);
};


export async function joinEvent(eventId, participantData) {
  
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      'participants._id': { $ne: participantData._id }, 
      $expr: { $lt: [{ $size: "$participants" }, "$slots"] } 
    },
    {
      $push: { participants: participantData } 
    },
    {
      new: true 
    }
  );

  if (!event) {
    const existingEvent = await Event.findById(eventId);
    
    if (!existingEvent) {
      throw new Error('Event not found.');
    }
    
    const isFull = (existingEvent.participants?.length || 0) >= existingEvent.slots;
    if (isFull) {
      throw new Error('Event is already full.');
    }

    const alreadyJoined = existingEvent.participants.some(p => p._id.equals(participantData._id));
    if (alreadyJoined) {
      throw new Error('You have already joined this event.');
    }
    
    throw new Error('Could not register for the event. Please try again.');
  }

  // Update user with reference to the Joined event
  try {
    await User.updateOne(
      { _id: participantData._id },
      { $addToSet: { joinedEvents: eventId } }
    );
  } catch (err) {
    console.error("Error updating user's joinedEvents:", err);
  }
  
  return event;
}


export const getMyEvents = async (userId, skip = 0, limit = 10) => {
  try {
    const user = await User.findById(userId).select('joinedEvents').lean();
    const eventIds = user?.joinedEvents || [];
    
    const query = {
      $or: [
        { owner: userId },
        { _id: { $in: eventIds } }
      ]
    };

    const totalEvents = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('sport', 'name')
      .populate('participants', '_id') 
      .sort({ date: 1 }) 
      .skip(skip)
      .limit(limit)
      .lean(); 

    return { events, totalEvents };
    
  } catch (err) {
    console.error("Error in getMyEvents:", err);
    throw err;
  }
};


export async function deleteEvent(eventId, userId) {
  const event = await Event.findOneAndDelete({ 
    _id: eventId, 
    owner: userId 
  });

  if (!event) {
    throw new Error('Event not found, or you are not the owner.');
  }

  try {
    await User.updateMany(
      { joinedEvents: eventId },
      { $pull: { joinedEvents: eventId } }
    );
  } catch (err) {
    console.error("Error cleaning up joinedEvents on event delete:", err);
  }
  
  return event;
}


export async function leaveEvent(eventId, userId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId },
    { $pull: { participants: { _id: userId } } }
  );

  if (!event) {

    console.warn(`Event not found (or user not in it) during leave: ${eventId}`);
  }

  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { joinedEvents: eventId } }
    );
  } catch (err) {
    console.error("Error updating user's joinedEvents (leave):", err);
  }
  return event;
}

export async function createEvent(eventData) {
  const sportId = await getSportIdByName(eventData.sport);
  if (!sportId) {
    throw new Error('Invalid sport selected. Please refresh and try again.');
  }

  const fullEventData = {
    ...eventData,
    sport: sportId, 
    participants: [] 
  };

  const newEvent = new Event(fullEventData);
  await newEvent.save();

  try {
    await User.updateOne(
      { _id: newEvent.owner },
      { $push: { createdEvents: newEvent._id } }
    );
  } catch (err) {
    console.error("Error updating user's createdEvents:", err);
  }
  
  return newEvent;
}

export async function findUserByIdAndUpdate(userId, updateData) {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return updatedUser;
}


export async function updateEvent(eventId, userId, updateData) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found.");
  }
  if (event.owner.toString() !== userId.toString()) {
    throw new Error("Unauthorized: You can only edit your own events.");
  }

  if (updateData.slots && updateData.slots < event.participants.length) {
    throw new Error(`Cannot set slots to ${updateData.slots} because ${event.participants.length} people have already joined.`);
  }
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: updateData },
    { new: true, runValidators: true } 
  );

  return updatedEvent;
}


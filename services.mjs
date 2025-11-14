import {Event, Sport, User} from './db.mjs'; 

const formatEvents = (events) => {
  if (!Array.isArray(events)) events = [events]; // handle single event
  
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
}

export const getOptionsFromEvents = async (optionName) =>{
   const optionsArray = await Event.distinct(optionName);
   const options = optionsArray.map(option => ({ value: option, label: option }));
   return options;
}

export const getSportIdByName = async (sportName) => {
  const sport = await Sport.findOne({ name: sportName }).lean();
  return sport?._id || null;
};

export const getEventById = async (id) => {
  const event = await Event.findOne({ _id: id })
    .populate('sport')           
    .populate('owner', 'name email') 
    .populate('participants', 'name email') 
    .lean();

  return formatEvents(event)[0];
}

export const getUserById = async (id) => {
  const user = await User.findOne({ _id: id })
    .select('-password -resetToken -resetTokenExpiry')
    .lean();

  return user;
}

export const getEventsCount = async (query = {}) => {

  return await Event.countDocuments(query);
};


export async function joinEvent(eventId, participantData) {
  
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      'participants._id': { $ne: participantData._id }, 
      $expr: { $lt: [ { $size: "$participants" }, "$slots" ] } 
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
  

  return event;
}
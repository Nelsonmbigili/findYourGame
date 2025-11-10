import {Event, Sport} from './db.mjs'; 


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


export const getThisWeekEvents = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  const events = await Event.find({
    date: { $gte: today, $lte: endOfWeek }
  }).sort({ date: 1 }).lean();

  return formatEvents(events);
};

export const getThisMonthEvents = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekFromToday = new Date(today);
  oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const events = await Event.find({
    date: { $gt: oneWeekFromToday, $lte: endOfMonth }
  }).sort({ date: 1 }).lean();

  return formatEvents(events);
};

export const getFutureEvents = async () => {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const events = await Event.find({
    date: { $gt: endOfMonth }
  }).sort({ date: 1 }).lean();

  return formatEvents(events);
};


export const getSearchResults = async (filter) => {
  try {

    const results = await Event.find(filter)  
      .lean()  // To allow modifying results
      .exec();

    console.log("Results: ", results);

    return formatEvents(results);

  } catch (err) {
    console.error("Error fetching search results:", err);
    return [];
  }
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

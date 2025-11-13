import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './config.mjs';
import "./db.mjs";
import { 
    signup, 
    signin, 
    startAuthenticatedSession, 
    endAuthenticatedSession, 
    generatePasswordResetToken,
    validatePasswordResetToken,
    resetUserPassword,
    findUserByEmail
} from './auth.mjs';
import sanitize from 'mongo-sanitize';
import session from "express-session";
import passport from 'passport';
import './passport-config.mjs';
import { sendPasswordResetEmail } from "./email-config.mjs";
import hbs from 'hbs';
import { 
  getSearchResults,
  getSportsOptions,
  getOptionsFromEvents,
  getSportIdByName,
  getEventById,
  getUserById,
  getEventsCount
} from "./services.mjs";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "hbs");
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false, 
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production'}
}));

const protectedPaths = ['/dashboard'];
const outOnlyPaths = ['/signin','/signup','/forgotpassword'];

app.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null;
  }
  res.locals.year = new Date().getFullYear(); 

  if (protectedPaths.includes(req.path) && !req.session.user) {
    return res.redirect('/signin');
  }

  if ((outOnlyPaths.includes(req.path)) && req.session.user) {
    return res.redirect('/dashboard'); 
  }
  next();
});

app.get('/', (req, res) => {

  res.render('index', { 
    title: 'Home - FindYourGame', 
    featuredEvents: {} 
  });
});


app.get("/about", (req,res)=>{
	res.render("about",{});
});


// Ajax API for fetching Events
app.get("/api/events/search", async (req, res) => {
  try {
    const search = sanitize(req.query);

    const page = parseInt(search.page) || 1;
    const limit = parseInt(search.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sort = { date: 1 }; 

    let query = {};
    if (search.search_query) {
      query.title = { $regex: search.search_query, $options: "i" };
    }

    if (search.filter_by && search.filter_option) {
      switch (search.filter_by) {
        case "sport":
          const sportId = await getSportIdByName(search.filter_option);
          if (sportId) query.sport = sportId;
          else return res.json({ events: [], pagination: { totalPages: 0, currentPage: 1, totalEvents: 0 } });
          break;
        
        case "location":
          query.location = search.filter_option;
          break;
        
        case "time":
          if (search.filter_option === "morning") query.time = { $gte: "06:00", $lt: "12:00" };
          else if (search.filter_option === "afternoon") query.time = { $gte: "12:00", $lt: "18:00" };
          else if (search.filter_option === "evening") query.time = { $gte: "18:00", $lt: "22:00" };
          break;
        
        case "date":
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate()+1);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          const endOfWeek = new Date(today);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          endOfWeek.setHours(23, 59, 59, 999);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);

          if (search.filter_option === "today") query.date = { $gte: today, $lte: endOfToday }; 
          else if (search.filter_option === "tomorrow") query.date = { $gte: today, $lte: endOfTomorrow };
          else if (search.filter_option === "thisWeek") query.date = { $gte: today, $lte: endOfWeek }; 
          else if (search.filter_option === "thisMonth") {
            const oneWeekFromToday = new Date(today);
            oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
            query.date = { $gt: oneWeekFromToday, $lte: endOfMonth };
          }
          break;
        
        case "fee":
          query.fee = search.filter_option === "free" ? 0 : { $gt: 0 };
          break;
        
        case "availability":
          if (search.filter_option === "available") {
            query.$expr = { $lt: [{ $size: "$participants" }, "$slots"] };
          } else if (search.filter_option === "full") {
            query.$expr = { $eq: [{ $size: "$participants" }, "$slots"] };
          }
          break;
      }
    }

    console.log("API Query: ", query);

    // Get Results from Database
    const searchResults = await  getSearchResults(query, sort, skip, limit);

    const totalEvents = await  getEventsCount(query);

    const totalPages = Math.ceil(totalEvents / limit);

    const formattedResults = searchResults.map(event => {

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toString() === "Invalid Date"
          ? "No Date"
          : eventDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
        
        const spotsLeft = (event.slots || 0) - (event.participants?.length || 0);
        const slotsRemainingText = spotsLeft > 0 ? `${spotsLeft} slots` : "Full";

        return {
            _id: event._id,
            title: event.title,
            sport: event.sport, 
            location: event.location,
            formattedDate: formattedDate,
            formattedTime: event.time || "No Time",
            slotsRemainingText: slotsRemainingText
        };
    });
    
    res.json({
      events: formattedResults,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEvents: totalEvents,
        limit: limit
      }
    });

  } catch (error) {
    console.error("API Search Error:", error);
    res.status(500).json({ error: "Server error while searching" });
  }
});


app.get("/events", async (req, res) => {
  try {
    res.render("events", {
      title: "Events",
      user: req.session?.user || null
    });

  } catch (error) {
    console.error("Error rendering events page:", error);
    res.status(500).render("error", { 
      message: "Unable to load events page",
      user: req.session?.user || null
    });
  }
});


// AJAX for populating filter options 
app.get("/api/events/filter-options/:field", async (req, res) => {
  const { field } = req.params;
  try {
    let options = [];

    switch(field) {
      case "sport":
        options =  await getSportsOptions();
        break;
      case "location":
        options = await getOptionsFromEvents("location");
        break;
      case "time":
        options = [
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "evening", label: "Evening" }
        ];
        break;
      case "date":
        options = [
          { value: "today", label: "Today" },
          { value: "tomorrow", label: "Tomorrow" },
          { value: "thisWeek", label: "This Week" },
          { value: "thisMonth", label: "This Month" }
        ];
        break;
      case "fee":
        options = [
          { value: "free", label: "Free" },
          { value: "paid", label: "Paid" }
        ];
        break;
      case "availability":
        options = [
          { value: "available", label: "Available" },
          { value: "full", label: "Full" }
        ];
        break;
    }

    res.json(options);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/events/:id', async (req, res) => {
  try {
    const eventID = req.params.id;

    const event = await getEventById(eventID);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Organizer initials
    const ownerInitials = event.owner?.name?.firstName?.[0]?.toUpperCase() || '';

    const maxDisplay = 5;
    const displayedParticipants = (event.participants || []).slice(0, maxDisplay);
    const hasMoreParticipants = (event.participants?.length || 0) > maxDisplay;
    const remainingCount = (event.participants?.length || 0) - maxDisplay;

    // User flags
    const user = req.session.user;
    const userId = user?._id?.toString();
    const ownerId = event.owner?._id?.toString();

    const isOwner = userId && ownerId && userId === ownerId;
    const isParticipant = userId && event.participants.some(p => p._id.toString() === userId);
    const isFull = (event.participants?.length || 0) >= event.slots;

    res.render('eventDetails', {
      event,
      ownerInitials,
      participants: displayedParticipants,
      hasMoreParticipants,
      remainingCount,
      showParticipants: (event.participants?.length || 0) > 0,
      user: user,
      owner: isOwner,
      isParticipant,
      isFull
    });
  } catch (error) {
    console.error('Error loading event:', error);
    res.status(500).send('Server error');
  }
});


app.get('/events/:id/join', (req, res) => {
  res.render('comingSoon', { });
});


app.get("/dashboard", async (req, res) => {
  const userID = req.session.user.id
  const user = await getUserById(userID);
  console.log("User Object: ", user);
  res.render("dashboard", {
    title: "Dashboard",
    user
  });
});


app.get("/dashboard/myevents", async (req, res) => {
  const userID = req.session.user.id
  const user = await getUserById(userID);
  console.log("User Object: ", user);
  res.render("dashboard", {
    title: "Dashboard",
    user
  });
});


app.get("/dashboard/create-event", async (req, res) => {
  const userID = req.session.user.id
  const user = await getUserById(userID);
  console.log("User Object: ", user);
  res.render("create", {
    title: "create",
    user
  });
});


app.get("/dashboard/settings", async (req, res) => {
  const userID = req.session.user.id
  const user = await getUserById(userID);
  console.log("User Object: ", user);
  res.render("dashboard", {
    title: "Dashboard",
    user
  });
});

app.get("/signin", (req,res)=>{
  res.render("signin",{});
});

app.post("/signin", async (req,res)=>{
  const safeBody = sanitize(req.body);
  const { email, password} = safeBody;

  try {
    // Call the async signin function
    const signedUser = await signin(email, password);
    await startAuthenticatedSession(req, signedUser);

    res.redirect("/events"); 

  } catch (error) {
    console.error("Signin Error:", error.message);
    res.status(400).render("signin", { 
      error: error.message,
      email: email 
    });
  }
});

app.get("/signup",(req,res)=>{
  res.render("signup",{});
});

app.post("/signup", async (req, res) => {
  const safeBody = sanitize(req.body);
  const { firstName, secondName, email, password } = safeBody;

  const names = { firstName, secondName};

  try {
    await signup(names, email, password);
    
    res.redirect("/signin"); 

  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(400).render("signup", { 
      error: error.message,
      firstName: firstName,
      secondName: secondName,
      email: email 
    });
  }
});


app.get('/login/federated/google', passport.authenticate('google'));

app.get('/oauth2/redirect/google',
  passport.authenticate('google', {
    failureRedirect: '/signin',  
    failureMessage: true,       
    session: false           
  }),
  async (req, res) => {
    try {
      const userForSession = {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        name: req.user.name
      };
      
      await startAuthenticatedSession(req, userForSession);
      res.redirect("/events"); 
      
    } catch (error) {
      console.error("Google Session Error:", error.message);
      res.status(400).render("signin", { 
        error: "Error starting Google session. Please try again.",
        title: 'Sign In - FindYourGame'
      });
    }
  }
);

app.get('/login/federated/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/oauth2/redirect/github',
  passport.authenticate('github', {
    failureRedirect: '/signin',
    failureMessage: true,
    session: false 
  }),
  async (req, res) => {
    try {
      const userForSession = {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        name: req.user.name
      };
      
      await startAuthenticatedSession(req, userForSession);
      res.redirect("/events"); 
      
    } catch (error) {
      console.error("GitHub Session Error:", error.message);
      res.status(400).render("signin", { 
        error: "Error starting GitHub session. Please try again.",
        title: 'Sign In - FindYourGame'
      });
    }
  }
);


app.get("/signout", async (req, res) => {
  try {
    await endAuthenticatedSession(req);
    res.redirect("/");
  } catch (error) {
    console.error("Signout Error:", error);
    res.redirect("/");
  }
});


app.get("/forgotpassword", (req,res)=>{
  res.render("forgotpassword",{});
});

app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword", {
    title: "Forgot Password"
  });
});


app.post("/forgotpassword", async (req, res) => {
  const safeBody = sanitize(req.body);
  const { email } = safeBody;

  const successMessage = "If an account with that email exists, a password reset link has been sent.";

  try {
    const user = await findUserByEmail(email);

    if (user) {
      const unhashedToken = await generatePasswordResetToken(user);
      await sendPasswordResetEmail(user.email, unhashedToken);
    }

    res.render("forgotpassword", { success: successMessage });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.render("forgotpassword", { success: successMessage });
  }
});


app.get("/resetpassword/:token", async (req, res) => {
  try {
    const user = await validatePasswordResetToken(req.params.token);
    if (!user) {
      return res.status(400).render("forgotpassword", {
        error: "Password reset token is invalid or has expired."
      });
    }

    res.render("resetpassword", {
      title: "Reset Your Password"
    });

  } catch (error) {
    console.error("Reset Password GET Error:", error);
    res.redirect("/forgotpassword");
  }
});

app.post("/resetpassword/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;
  try {
    const user = await validatePasswordResetToken(req.params.token);

    if (!user) {
      return res.status(400).render("forgotpassword", {
        error: "Password reset token is invalid or has expired."
      });
    }

    await resetUserPassword(user, password, confirmPassword);

    res.redirect("/signin");

  } catch (error) {
    console.error("Reset Password POST Error:", error);
    res.status(400).render("resetpassword", {
      error: error.message || "An error occurred. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
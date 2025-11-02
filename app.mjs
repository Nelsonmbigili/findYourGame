import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './config.mjs';
import "./db.mjs";
import { signup, signin, startAuthenticatedSession, endAuthenticatedSession } from './auth.mjs';
import sanitize from 'mongo-sanitize';
import session from "express-session";
import passport from 'passport';
import './passport-config.mjs';



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'documentation')));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false, 
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production'}
}));

const protectedPaths = ['/dashboard'];

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
  
  if ((req.path === '/signin' || req.path === '/signup') && req.session.user) {
    return res.redirect('/dashboard'); 
  }
  next();
});


app.set("view engine", "hbs");
const allEvents=[];
app.get('/', (req, res) => {
  
const featuredEvents = allEvents.slice(0, 3);

  res.render('index', { 
    title: 'Home - FindYourGame', 
    featuredEvents: featuredEvents 
  });
});

app.get("/about", (req,res)=>{
	res.render("about",{});

});

app.get("/events", (req,res)=>{
  res.render("events",{});
});

app.get("/dashboard", (req,res)=>{
  res.render("dashboard",{});
});

app.get("/signin", (req,res)=>{
  res.render("signin",{});
});


app.post("/signin", async  (req,res)=>{
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
    // Call the async signup function
    const newUser = await signup(names, email, password);
    
    // On success, redirect the user to the sign-in page
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

// This is the callback route Google redirects to
app.get('/oauth2/redirect/google',
  passport.authenticate('google', {
    failureRedirect: '/signin',  // Redirect to signin on failure
    failureMessage: true,        // Add a failure message
    session: false               // We are not using Passport sessions
  }),
  async (req, res) => {
    // 'req.user' is the Mongoose user from our passport-config
    try {
      // Create the same user object that our local 'signin' function creates
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


app.get("/signout", async (req, res) => {
  try {
    await endAuthenticatedSession(req);
    // Redirect to the home page after session is destroyed
    res.redirect("/");
  } catch (error) {
    console.error("Signout Error:", error);
    res.redirect("/");
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
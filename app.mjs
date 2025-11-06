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
  getFutureEvents,
  getThisWeekEvents,
  getThisMonthEvents,
} from "./services.mjs";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "hbs");
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'documentation')));
app.use(express.urlencoded({ extended: false }));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

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

app.get("/events", async (req, res) => {
  try {
    const thisWeekEvents = await getThisWeekEvents();
    const thisMonthEvents = await getThisMonthEvents();
    const futureEvents = await getFutureEvents();

    res.render("events", {
      title: "Events",
      thisWeekEvents,
      thisMonthEvents,
      futureEvents,
      user: req.session?.user || null
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).render("events", {
      title: "Events",
      thisWeekEvents: [],
      thisMonthEvents: [],
      futureEvents: [],
      error: "Unable to load events at this time",
      user: req.session?.user || null
    });
  }
});

app.get('/events/:id/join', (req, res) => {
  
  res.render('comingSoon', { });
});


app.get('/events/search', (req, res) => {
  res.render('comingSoon');
});


app.get("/dashboard", (req, res) => {
  const user = req.session.user;
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
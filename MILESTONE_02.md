Milestone 02
===

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili

Live Link
---
https://findyourgame.onrender.com

Special Instructions for Using Form 
---

### Complete Authetication Flow

You can [**Sign Up**](https://findyourgame.onrender.com/signup) using one of the following methods:

1. **Email & Password**  
2. **Google OAuth**  
3. **GitHub OAuth**  


#### Password Reset
If you forget your password, you can reset it by:
1. Clicking **“Forgot Password”** on the sign-in page.  
2. Entering your registered email address.  
3. Checking your inbox for a password reset link.  

#### After Signing In
Once signed in:
- You can access your **Dashboard** — a protected route available only to authenticated users.  
- You will **not** be able to view the **Sign In** or **Sign Up** pages again until you sign out.

#### Coming Soon
Authentication will also be required for upcoming features:
- **Creating Events**  
- **Joining Events**

URL for forms
---
https://findyourgame.onrender.com/signup

https://findyourgame.onrender.com/signin

https://findyourgame.onrender.com/forgotpassword

URL for form result
---
https://findyourgame.onrender.com/dashboard

https://findyourgame.onrender.com/resetpassword/:token (Sent Via Email)


Reseach Topics 
---

I have implemented **Passport Authentication** using both **Google** and **GitHub** OAuth strategies.

- **Auth with Google:**  
  [View on GitHub](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/4311bf2676f2898bb8a454de80caa94f31b6958e/passport-config.mjs#L9)

- **Auth with GitHub:**  
  [View on GitHub](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/4311bf2676f2898bb8a454de80caa94f31b6958e/passport-config.mjs#L58)
---


References 
---
Authentication and password recovery features were implemented using trusted open-source libraries and documentation.

### Password Reset Emails with Nodemailer
- Used [Nodemailer](https://www.npmjs.com/package/nodemailer) package to send password reset URLs with a secure token.
- The reset flow involves:
  1. Generating a secure token using Node’s `crypto` module.  
  2. Storing the hashed token and expiry time in the database.  
  3. Sending a reset email via Nodemailer with a unique link.
- **View implementation:**  
  [Password Reset Logic on GitHub](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/4311bf2676f2898bb8a454de80caa94f31b6958e/email-config.mjs#L4)

### Authentication with Passport
- For User authentication I used [Passport.js](http://www.passportjs.org/) for secure OAuth integration.
- Implemented Google and GitHub login strategies with `passport-google-oauth20` and `passport-github2`.
 
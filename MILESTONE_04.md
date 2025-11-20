# Milestone 04 - Final Project Documentation


## NetID 
``` javascript 
nfm8340
```
## Name
``` javascript 
Nelson Francis Mbigili
```

## Repository Link
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili

## URL for deployed site 
https://findyourgame.onrender.com

## URLs for form 1 

https://findyourgame.onrender.com/signup  
https://findyourgame.onrender.com/signin  
https://findyourgame.onrender.com/forgotpassword
https://findyourgame.onrender.com/resetpassword/:secrettoken

## Special Instructions for Form 1

- Complete authentication flow is required.  
- Users must be signed in to access the **Dashboard** and **Events** features.  
- After signing in, users cannot access the Sign In or Sign Up pages until they sign out.

## URLs for form 2 

https://findyourgame.onrender.com/events  
https://findyourgame.onrender.com/dashboard/myevents

## Special Instructions for Form 2
- Users must be signed in to **create events**, **join events**, or **delete events**.  
- The Events page uses **AJAX** to dynamically load and filter events without page refresh.  
- Frontend JavaScript handles interaction with the API endpoints for events (`/api/events/...`).  
- My Events page allows users to see their events, join or leave events in real-time.

## URL for form 3 (current millestone)
There are several additional forms (eg. edit Events, edit User Profile) implemented as modals in: </br>
https://findyourgame.onrender.com/dashboard </br>
https://findyourgame.onrender.com/events


## Special Instructions for Form 3

For this milestone, the application includes a more robust approach to managing user and event state. The following features are implemented and can be accessed throughout the app:

- **Edit Profile (Settings)**
- **Edit Events**
- **View Profiles**

Most of these features are implemented using **modal dialogs**.  
Please click the corresponding **action buttons (icons)** to open and test each modal.

Additionally, SMTP emails were being blocked by Render during deployment, so the project now uses an **email API service**  (Gmail) to handle all email functionality for password resets.


## First link to github line number(s) for constructor, HOF, etc.
- [Used map to format Events for display](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/services.mjs#L6)
- [Used map to format Events for display](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/app.mjs#L385)

## Second link to github line number(s) for constructor, HOF, etc.
- [Used reduce to build updates object for an Event](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/services.mjs#L6)

## Short description for links above
The First (map) in formating events, it formats event data by mapping over an array of events to produce human-readable formattedDate and formattedTime strings, and calculates slotsRemaining by subtracting the number of participants from the total slots, preparing the data for display on the frontend.

The second (reduce) iterates over the list of fields (image, phone, about, sports) from the request body and constructs an updates object containing only the fields that have values. It also ensures that the sports field is always formatted as an array. This object is then used to update the user in the database.

## Link to github line number(s) for schemas (db.js or models folder)

- [User schemas](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/db.mjs#L10)
- [Event schemas](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/db.mjs#L34)
- [Sport schemas](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/db.mjs#L58)

## Description of research topics above with points

**5 points – User Authentication (Local + OAuth)**  
Implemented dual authentication:  
- **Local Strategy:** Users register and log in using email/username and hashed passwords.  
- **OAuth Strategy:** Users can sign in using **Google** and **GitHub**.  


**2 points – Client-Side Input Validation**  
Validation implemented for registration, login, and event creation forms.  
Real-time feedback ensures proper formatting, required fields, and valid input types.

**2 points – Server-Side Validation**  
All incoming data is validated on the backend to block malformed or unsafe inputs.  
Event fields, user credentials, and profile updates follow secure validation rules.

**2 points – Session Management**  
Session-based authentication allows users to remain logged in securely.  
Only authenticated users can access protected pages such as Dashboard, My Events, and Event Creation.

**1 point – Email Functionality (Password Reset + Deployment Research)**  
Implemented secure password reset via email.  
After discovering that SMTP was blocked by Render, researched alternatives and integrated a reliable **email API service** for sending reset links and notifications.

---

### Planned but Not Completed (Future Work)

These were part of the original plan but were not fully implemented:
- **Unit Testing (Mocha)**
- **Stripe Payments Integration**
- **Map Integration (Google Maps, Leaflet, Mapbox)**
- **Analytics / Activity Tracking**

## Links to github line number(s) for research topics described above (one link per line)
---

- [OAuth](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/db.mjs#L10)
- [Client side validation](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/db.mjs#L34)
- [Server side validation](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/app.mjs#L541)
- [Email Functionality](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/f11f2b124315099d60d031a9d87d3781f1e3ebb5/email-config.mjs#L1)

## Optional Project Notes
- Uses **AJAX/Fetch API** for dynamic, smooth user interactions.  
- **My Events** dashboard supports full **CRUD operations** via modals without page reloads.  
- **Robust session handling:** expired sessions or deleted users trigger frontend redirects on 401/404 AJAX responses.  
- **Images** are managed via URL inputs for simple hosting on Render.  

## Attributions
- `passport-config.mjs` – Passport.js setup based on [Passport.js documentation](http://www.passportjs.org/docs/).  
- `views/dashboard.hbs` – Sidebar and dashboard layout inspired by **Tailwind UI**, adapted with custom CSS.  
- `public/js/eventDetails.js` – AJAX modal implementation guided by [MDN Dialog element documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog).  


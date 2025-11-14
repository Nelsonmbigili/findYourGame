# Milestone 03
---

## Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili

---

## URL for form 1 (from previous milestone) 
---
https://findyourgame.onrender.com/signup  
https://findyourgame.onrender.com/signin  
https://findyourgame.onrender.com/forgotpassword

---

## Special Instructions for Form 1
---
- Complete authentication flow is required.  
- Users must be signed in to access the **Dashboard** and **Events** features.  
- After signing in, users cannot access the Sign In or Sign Up pages until they sign out.

---

## URL for form 2 (for current milestone)
---
https://findyourgame.onrender.com/events  
https://findyourgame.onrender.com/dashboard/myevents

---

## Special Instructions for Form 2
---
- Users must be signed in to **create events**, **join events**, or **delete events**.  
- The Events page uses **AJAX** to dynamically load and filter events without page refresh.  
- Frontend JavaScript handles interaction with the API endpoints for events (`/api/events/...`).  
- My Events page allows users to see their events, join or leave events in real-time.

---

## URL(s) to GitHub repository with commits that show progress on research
---
- **Creating Events:**  
[services.mjs – createEvent function](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/main/services.mjs#L140)  
- **Joining/Leaving Events:**  
[services.mjs – joinEvent & leaveEvent functions](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/main/services.mjs#L180)  
- **AJAX interaction & frontend JS:**  
[public/myEvents.js](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/main/public/myEvents.js)  
[public/events.js](https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-Nelsonmbigili/blob/main/public/events.js)

---

## References
---
- Implemented **AJAX requests** for dynamic event loading and filtering based on previous tutorials on REST APIs.  
- Frontend JavaScript references from MDN and documentation for `fetch()`, DOM manipulation, and event listeners.  
- Backend event handling and database interaction were based on **MongoDB CRUD patterns** and prior research from Milestone 02.

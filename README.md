# FindYourGame

## Overview

In today’s fast-paced urban life, many people are so busy with work that they often forget to stay active or find time to play. Even when they want to, they rarely know where to start or how to find others to join.

FindYourGame is a web app designed to make it easy for people to discover and join sports events happening around their city. Users can create an account, log in, and either register new games or join existing ones based on their interests and schedules. The platform provides clear information about event times, locations, and availability. Some events may include small fees to cover field reservations or facility costs.

With FindYourGame, staying active and social has never been simpler—just find your game and play.


## Data Model

The application FindYourGame will store information about Users, Sports Events and Sports.

Users can create and join multiple sports events (via references).

Each event is linked to one sport, one location, and one user who created it and has ids of participating users.

Sports define the different types of games available in the app.


An Example User:

```javascript
{
  username: "nelsonplayer",
  email: "nelson@example.com",
  hash:                             // a password hash,
  createdEvents: ["e101", "e205"],  // references to Events the user created
  joinedEvents: ["e108", "e222"],   // references to Events the user joined
  createdAt:                      
}
```

An Example Sports Event:

```javascript
{
  title: "Saturday Morning Football",
  desciption:"Please bring a pair of Shoes and two Tshirts black and red"  
  sport: "Football",                     // reference to a Sport document
  location: "Central Park",              // Embeded Document with more details like (Address / GPS data for Map)
  date: "2025-10-25",
  time: "10:00 AM",
  fee: 5.00,
  slots: 12,
  owner: "u001",                          // reference to User who created the event
  participants: ["u002", "u005", "u009"], // user IDs of participants
  createdAt:                              // timestamp
}
```

An Example Sport:

```javascript
{
  name: "Football",
  type: "Team",
  equipment: ["ball", "Jerseys"]
}
```


## [Link to Commented First Draft Schema](db.mjs) 


## Wireframes

/ – landing page for introducing the app to new users

![landing page](documentation/landing-page.png)

/signup – page for creating a new user account

![sign up](documentation/SignUp-page.png)

/login – page for logging in existing users

![sign in](documentation/Sign-In-page.png)

/events – page for showing all available sports events

![all events](documentation/AllEvents-page.png)

/events/create – page for creating a new sports event

![create event](documentation/CreateEvent-page.png)

/events/:id – page for showing a specific event’s details

![event details](documentation/EventDetails-page.png)

/profile – page for showing the user’s profile and account information

![profile](documentation/Profile-page.png)


## Site map

(__TODO__: draw out a site map that shows how pages are related to each other)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

(__TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://en.wikipedia.org/wiki/Use_case))

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can create a new grocery list
4. as a user, I can view all of the grocery lists I've created in a single list
5. as a user, I can add items to an existing grocery list
6. as a user, I can cross off items in an existing grocery list

## Research Topics

(__TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit)


## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)


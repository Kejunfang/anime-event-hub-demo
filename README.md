# Taylor's Anime Event Hub

Taylor's Anime Event Hub is a demo event management web application for Taylor's University students who want to discover, create, and join anime-related campus events.

## Purpose

This prototype supports a Web Application Programming assignment demo. It shows the main user flows before a real PHP backend and database are connected.

## Features

- Home page with platform introduction and featured events
- Register and login using temporary browser data
- Profile view for the logged-in demo user
- Event listing with anime-related dummy data
- Category filtering
- Event details modal
- Join event flow with duplicate-join prevention
- Create event form for logged-in users
- My Events page for joined and created events
- Responsive layout for desktop and mobile presentation

## Technologies Used

- HTML
- CSS
- JavaScript
- localStorage as a temporary mock database

No backend server is required for this demo stage.

## How To Run The Demo

Open this file in a browser:

```text
anime-event-hub/index.html
```

The demo works by directly opening `index.html`; no PHP runtime, database server, or package installation is needed.

## Temporary Database

The demo stores records in `localStorage` using these keys:

```text
taeh_users
taeh_currentUser
taeh_events
taeh_joinedEvents
```

Default events are defined in:

```text
data/mockData.js
```

When the app first opens, it copies the default events into localStorage. User registration, login state, created events, and joined events are then saved in the browser.

To reset demo data, clear the browser localStorage for this page and refresh.

## Demo Data

The prototype includes 8 default anime-related events:

1. Anime Movie Night: Your Name Screening
2. Cosplay Meetup 2026
3. Manga Drawing Workshop
4. Anime Voice Acting Challenge
5. Japanese Culture Mini Festival
6. Anime Music Night
7. Genshin Impact Campus Tournament
8. Anime Club Ice Breaking Day

## Future PHP And MySQL Upgrade Plan

Replace localStorage with server-side PHP scripts and a real database.

Suggested database tables:

```sql
users (
  id,
  full_name,
  student_id,
  email,
  password_hash,
  created_at
)

events (
  id,
  title,
  category,
  event_date,
  event_time,
  location,
  description,
  created_by,
  created_at
)

event_registrations (
  id,
  user_id,
  event_id,
  joined_at
)
```

Suggested PHP files:

```text
db_connect.php
register.php
login.php
logout.php
create_event.php
join_event.php
get_events.php
my_events.php
```

Backend upgrade notes:

- `db_connect.php` should hold the MySQL connection.
- `register.php` should validate user input and store hashed passwords.
- `login.php` should verify credentials and create a PHP session.
- `create_event.php` should insert records into the `events` table.
- `join_event.php` should insert records into `event_registrations` and prevent duplicates.
- Event pages should read data from MySQL instead of `localStorage`.

## Presentation Checklist

- Register a new demo account
- Login with the new account
- Browse the event grid
- Filter events by category
- Open an event details modal
- Join an event
- Create a new event
- View joined and created events in My Events

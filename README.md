# Taylor's Anime Event Hub

Taylor's Anime Event Hub is a static demo web application for Taylor's University anime-related campus events and community posts.

The demo now supports two roles:

- Normal student user
- Admin

It uses `localStorage` as a temporary mock database. No backend server, PHP runtime, or MySQL server is required for this demo stage.

## Test Accounts

Use these accounts on the `Log In / Sign Up` page:

| Role | Email | Password |
| --- | --- | --- |
| Normal user | `student@example.com` | `student123` |
| Admin | `admin@example.com` | `admin123` |

There are also quick-fill buttons on the login panel for both demo accounts.

## Features

### Normal User

- Home page with featured events
- Event list with category filters
- Event detail modal
- Register for available events
- My Event page for joined events
- Cancel event registration
- Profile page with user details, my posts, and liked posts
- View posts
- Create posts
- Like, comment, and share posts
- Delete own posts
- View other user profiles

### Admin

- Event page
- Create event
- Edit event
- Delete event
- View users registered for each event
- View posts
- Create posts
- Like, comment, and share posts
- Delete any post
- Profile page with admin details, my posts, and liked posts
- View other user profiles

## How To Run The Demo

Open this file in a browser:

```text
index.html
```

The demo can be run directly from the file system.

## Temporary Database

The app stores mock records in browser `localStorage` with these keys:

```text
taeh_users
taeh_currentUser
taeh_events
taeh_registrations
taeh_posts
taeh_postLikes
taeh_postComments
taeh_postShares
```

Default data is defined in:

```text
data/mockData.js
```

To reset the demo data, clear localStorage for this page and refresh the browser.

## Mock Table Design

### users

| Field | Purpose |
| --- | --- |
| `user_id` | User ID |
| `username` | Username |
| `email` | Email |
| `password` | Demo password; real backend should hash this |
| `role` | `user` or `admin` |
| `anime_interest` | User's anime interests |
| `created_at` | Registration time |

### events

| Field | Purpose |
| --- | --- |
| `event_id` | Event ID |
| `title` | Event title |
| `category` | Event category |
| `description` | Event description |
| `event_date` | Event date |
| `event_time` | Event time |
| `location` | Event location |
| `capacity` | Maximum participants |
| `image_url` | Optional event image |
| `status` | `Upcoming`, `Full`, `Closed`, or demo-only `Deleted` |
| `created_by` | Admin user ID |
| `created_at` | Created time |

### registrations

| Field | Purpose |
| --- | --- |
| `registration_id` | Registration ID |
| `user_id` | Registered user ID |
| `event_id` | Registered event ID |
| `registration_date` | Registration time |
| `status` | `joined` or `cancelled` |

### posts

| Field | Purpose |
| --- | --- |
| `post_id` | Post ID |
| `user_id` | Author user ID |
| `title` | Post title |
| `content` | Post content |
| `image_url` | Optional post image |
| `created_at` | Created time |
| `updated_at` | Updated time |
| `status` | `active` or `deleted` |

### postLikes, postComments, postShares

These mock tables store post likes, comments, and shares using the field names from the project database design.

## Presentation Checklist

- Login as normal user with `student@example.com / student123`
- Browse events and open event details
- Join an event and confirm it appears in My Event
- Cancel a registration
- Create a post as normal user
- Like, comment, share, and delete own post
- Login as admin with `admin@example.com / admin123`
- Create, edit, and delete an event
- Open an event and view registered users
- Delete another user's post as admin

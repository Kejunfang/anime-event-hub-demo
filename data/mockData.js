window.TAEH_CATEGORIES = [
  "Screening",
  "Workshop",
  "Cosplay",
  "Gaming",
  "Culture",
  "Club Activity"
];

window.TAEH_DEFAULT_USERS = [
  {
    user_id: 1,
    username: "Alya Tan",
    email: "student@example.com",
    password: "student123",
    role: "user",
    anime_interest: "Slice of life, cosplay, anime music",
    created_at: "2026-05-01T09:30:00.000Z"
  },
  {
    user_id: 2,
    username: "Admin Haruto",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    anime_interest: "Event planning, workshops, campus clubs",
    created_at: "2026-05-01T09:00:00.000Z"
  },
  {
    user_id: 3,
    username: "Mei Wong",
    email: "mei@example.com",
    password: "mei123",
    role: "user",
    anime_interest: "Gaming, manga drawing, voice acting",
    created_at: "2026-05-04T11:20:00.000Z"
  }
];

window.TAEH_DEFAULT_EVENTS = [
  {
    event_id: 101,
    title: "Anime Movie Night: Your Name Screening",
    category: "Screening",
    description: "Bring your friends for a cozy evening screening of Your Name. The event includes a short pre-show discussion, light snacks, and a post-screening sharing session.",
    event_date: "2026-06-05",
    event_time: "19:30",
    location: "Lecture Theatre 12, Lakeside Campus",
    capacity: 60,
    image_url: "",
    status: "Upcoming",
    created_by: 2,
    created_at: "2026-05-03T10:00:00.000Z"
  },
  {
    event_id: 102,
    title: "Cosplay Meetup 2026",
    category: "Cosplay",
    description: "A friendly meetup for cosplay photos, costume tips, prop making, and character showcases. Beginners are welcome.",
    event_date: "2026-06-12",
    event_time: "16:00",
    location: "Student Life Centre",
    capacity: 35,
    image_url: "",
    status: "Upcoming",
    created_by: 2,
    created_at: "2026-05-05T12:00:00.000Z"
  },
  {
    event_id: 103,
    title: "Manga Drawing Workshop",
    category: "Workshop",
    description: "A hands-on workshop for students who want to improve manga paneling, expressions, and character posing.",
    event_date: "2026-06-18",
    event_time: "14:00",
    location: "Design Studio B",
    capacity: 25,
    image_url: "",
    status: "Upcoming",
    created_by: 2,
    created_at: "2026-05-06T08:30:00.000Z"
  },
  {
    event_id: 104,
    title: "Genshin Impact Campus Tournament",
    category: "Gaming",
    description: "Compete in anime-style game challenges with other Taylor's students. The tournament is designed for fun and community.",
    event_date: "2026-07-16",
    event_time: "13:00",
    location: "Computer Lab 5",
    capacity: 20,
    image_url: "",
    status: "Full",
    created_by: 2,
    created_at: "2026-05-09T15:45:00.000Z"
  }
];

window.TAEH_DEFAULT_REGISTRATIONS = [
  {
    registration_id: 1001,
    user_id: 1,
    event_id: 101,
    registration_date: "2026-05-10T10:12:00.000Z",
    status: "joined"
  },
  {
    registration_id: 1002,
    user_id: 3,
    event_id: 101,
    registration_date: "2026-05-10T10:45:00.000Z",
    status: "joined"
  },
  {
    registration_id: 1003,
    user_id: 1,
    event_id: 103,
    registration_date: "2026-05-11T15:00:00.000Z",
    status: "joined"
  }
];

window.TAEH_DEFAULT_POSTS = [
  {
    post_id: 201,
    user_id: 1,
    title: "Who is joining the movie night?",
    content: "I am bringing a small group for the Your Name screening. Would love to meet other students before the show starts.",
    image_url: "",
    created_at: "2026-05-12T09:10:00.000Z",
    updated_at: "2026-05-12T09:10:00.000Z",
    status: "active"
  },
  {
    post_id: 202,
    user_id: 2,
    title: "Cosplay meetup reminder",
    content: "Admin reminder: please keep props safe and campus-friendly. We will prepare a photo corner near Student Life Centre.",
    image_url: "",
    created_at: "2026-05-13T14:30:00.000Z",
    updated_at: "2026-05-13T14:30:00.000Z",
    status: "active"
  },
  {
    post_id: 203,
    user_id: 3,
    title: "Manga workshop materials",
    content: "Does anyone know if tablets are allowed, or should we bring sketchbooks only?",
    image_url: "",
    created_at: "2026-05-14T16:05:00.000Z",
    updated_at: "2026-05-14T16:05:00.000Z",
    status: "active"
  }
];

window.TAEH_DEFAULT_POST_LIKES = [
  { like_id: 301, post_id: 202, user_id: 1, created_at: "2026-05-13T15:00:00.000Z" },
  { like_id: 302, post_id: 201, user_id: 2, created_at: "2026-05-13T15:10:00.000Z" },
  { like_id: 303, post_id: 201, user_id: 3, created_at: "2026-05-13T15:15:00.000Z" }
];

window.TAEH_DEFAULT_POST_COMMENTS = [
  {
    comment_id: 401,
    post_id: 201,
    user_id: 3,
    comment_text: "I am joining too. Let's meet near the lecture theatre entrance.",
    created_at: "2026-05-12T10:20:00.000Z",
    updated_at: "2026-05-12T10:20:00.000Z",
    status: "active"
  }
];

window.TAEH_DEFAULT_POST_SHARES = [
  {
    share_id: 501,
    post_id: 202,
    user_id: 1,
    share_message: "Sharing this with my cosplay group.",
    created_at: "2026-05-13T16:00:00.000Z"
  }
];

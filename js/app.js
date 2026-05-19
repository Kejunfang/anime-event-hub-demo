const STORAGE_KEYS = {
  schemaVersion: "taeh_schemaVersion",
  users: "taeh_users",
  currentUser: "taeh_currentUser",
  events: "taeh_events",
  registrations: "taeh_registrations",
  posts: "taeh_posts",
  postLikes: "taeh_postLikes",
  postComments: "taeh_postComments",
  postShares: "taeh_postShares"
};

const SCHEMA_VERSION = "2";

const state = {
  currentView: "home",
  selectedCategory: "All",
  activeEventId: null
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function readStorage(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Unable to parse localStorage key: ${key}`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeStorage() {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.schemaVersion);
  if (storedVersion !== SCHEMA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem("taeh_joinedEvents");
  }

  const seeds = [
    [STORAGE_KEYS.users, window.TAEH_DEFAULT_USERS || []],
    [STORAGE_KEYS.events, window.TAEH_DEFAULT_EVENTS || []],
    [STORAGE_KEYS.registrations, window.TAEH_DEFAULT_REGISTRATIONS || []],
    [STORAGE_KEYS.posts, window.TAEH_DEFAULT_POSTS || []],
    [STORAGE_KEYS.postLikes, window.TAEH_DEFAULT_POST_LIKES || []],
    [STORAGE_KEYS.postComments, window.TAEH_DEFAULT_POST_COMMENTS || []],
    [STORAGE_KEYS.postShares, window.TAEH_DEFAULT_POST_SHARES || []]
  ];

  seeds.forEach(([key, fallback]) => {
    if (storedVersion !== SCHEMA_VERSION || !localStorage.getItem(key)) {
      writeStorage(key, fallback);
    }
  });

  localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
}

function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function getEvents() {
  return readStorage(STORAGE_KEYS.events, []);
}

function getRegistrations() {
  return readStorage(STORAGE_KEYS.registrations, []);
}

function getPosts() {
  return readStorage(STORAGE_KEYS.posts, []);
}

function getPostLikes() {
  return readStorage(STORAGE_KEYS.postLikes, []);
}

function getPostComments() {
  return readStorage(STORAGE_KEYS.postComments, []);
}

function getPostShares() {
  return readStorage(STORAGE_KEYS.postShares, []);
}

function getCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null);
}

function findUser(userId) {
  return getUsers().find((user) => Number(user.user_id) === Number(userId));
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }

  writeStorage(STORAGE_KEYS.currentUser, {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role,
    anime_interest: user.anime_interest,
    created_at: user.created_at
  });
}

function nextId(records, field) {
  const maxId = records.reduce((max, record) => Math.max(max, Number(record[field]) || 0), 0);
  return maxId + 1;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatTime(timeValue) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(`2026-01-01T${timeValue}`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function activeRegistrations(eventId) {
  return getRegistrations().filter((item) => (
    Number(item.event_id) === Number(eventId) && item.status === "joined"
  ));
}

function countParticipants(eventId) {
  return activeRegistrations(eventId).length;
}

function isAdmin() {
  return getCurrentUser()?.role === "admin";
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setMessage(selector, message, type = "neutral") {
  const element = qs(selector);
  if (!element) return;
  element.textContent = message;
  element.dataset.type = type;
}

function clearMessages() {
  ["#registerMessage", "#loginMessage", "#eventMessage", "#postMessage"].forEach((selector) => {
    setMessage(selector, "");
  });
}

function emptyStateTemplate(title, detail) {
  return `
    <div class="empty-state">
      <strong>${title}</strong>
      <p>${detail}</p>
    </div>
  `;
}

function renderNavigation() {
  const currentUser = getCurrentUser();
  const links = currentUser?.role === "admin"
    ? [
        ["events", "Events"],
        ["admin-events", "Create Event"],
        ["posts", "Posts"],
        ["profile", "Profile"]
      ]
    : [
        ["home", "Home"],
        ["events", "Events"],
        ["my-events", "My Event"],
        ["posts", "Posts"],
        ["profile", "Profile"]
      ];

  qs("#mainNav").innerHTML = [
    ...links.map(([view, label]) => `<a href="#${view}" data-view-link="${view}">${label}</a>`),
    currentUser ? "" : `<a href="#auth" data-view-link="auth" data-auth-link>Log In / Sign Up</a>`
  ].join("");
}

function renderCategoryOptions() {
  const eventCategory = qs("#eventCategory");
  if (eventCategory) {
    eventCategory.innerHTML = window.TAEH_CATEGORIES
      .map((category) => `<option value="${category}">${category}</option>`)
      .join("");
  }

  const filters = ["All", ...window.TAEH_CATEGORIES];
  qs("#categoryFilters").innerHTML = filters
    .map((category) => `
      <button class="filter-pill ${category === state.selectedCategory ? "active" : ""}" type="button" data-category="${category}">
        ${category}
      </button>
    `)
    .join("");
}

function eventStatus(event) {
  const participants = countParticipants(event.event_id);
  if (event.status === "Closed") return "Closed";
  if (participants >= Number(event.capacity)) return "Full";
  return event.status;
}

function eventCardTemplate(event, options = {}) {
  const participants = countParticipants(event.event_id);
  const status = eventStatus(event);
  const compactClass = options.compact ? " compact-card" : "";
  const artClass = event.category.toLowerCase().replace(/\s+/g, "-");

  return `
    <article class="event-card${compactClass}">
      <div class="event-art ${artClass}" ${event.image_url ? `style="background-image: linear-gradient(135deg, rgba(35,31,47,.22), rgba(255,111,145,.28)), url('${event.image_url}')"` : ""}>
        <span>${event.category}</span>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span class="category-tag">${status}</span>
          <span>${participants}/${event.capacity} joined</span>
        </div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <dl class="event-facts">
          <div><dt>Date</dt><dd>${formatDate(event.event_date)}</dd></div>
          <div><dt>Time</dt><dd>${formatTime(event.event_time)}</dd></div>
          <div><dt>Location</dt><dd>${event.location}</dd></div>
        </dl>
        <button class="secondary-btn" type="button" data-event-details="${event.event_id}">View Details</button>
      </div>
    </article>
  `;
}

function renderEvents() {
  const events = getEvents().filter((event) => event.status !== "Deleted");
  const filteredEvents = state.selectedCategory === "All"
    ? events
    : events.filter((event) => event.category === state.selectedCategory);

  qs("#eventsGrid").innerHTML = filteredEvents.length
    ? filteredEvents.map((event) => eventCardTemplate(event)).join("")
    : emptyStateTemplate("No events match this category yet.", "Try another category.");

  qs("#featuredEvents").innerHTML = events
    .slice(0, 3)
    .map((event) => eventCardTemplate(event, { compact: true }))
    .join("");
}

function renderMyEvents() {
  const currentUser = getCurrentUser();
  const container = qs("#myEventsGrid");

  if (!currentUser) {
    container.innerHTML = emptyStateTemplate("Login required", "Login or create a user account to view your registered events.");
    return;
  }

  const joinedIds = getRegistrations()
    .filter((item) => Number(item.user_id) === Number(currentUser.user_id) && item.status === "joined")
    .map((item) => Number(item.event_id));
  const events = getEvents().filter((event) => joinedIds.includes(Number(event.event_id)) && event.status !== "Deleted");

  container.innerHTML = events.length
    ? events.map((event) => `
        <article class="event-card compact-card">
          <div class="event-body">
            <div class="event-meta">
              <span class="category-tag">${event.category}</span>
              <span>${eventStatus(event)}</span>
            </div>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <dl class="event-facts">
              <div><dt>Date</dt><dd>${formatDate(event.event_date)}</dd></div>
              <div><dt>Time</dt><dd>${formatTime(event.event_time)}</dd></div>
              <div><dt>Location</dt><dd>${event.location}</dd></div>
            </dl>
            <button class="secondary-btn" type="button" data-cancel-registration="${event.event_id}">Cancel Registration</button>
          </div>
        </article>
      `).join("")
    : emptyStateTemplate("No registered events yet.", "Browse events and join one to see it here.");
}

function renderAdminEvents() {
  const container = qs("#adminEventList");
  if (!container) return;

  if (!isAdmin()) {
    container.innerHTML = emptyStateTemplate("Admin only", "Login with the admin demo account to manage events.");
    return;
  }

  container.innerHTML = getEvents()
    .filter((event) => event.status !== "Deleted")
    .map((event) => {
      const registeredUsers = activeRegistrations(event.event_id)
        .map((registration) => findUser(registration.user_id)?.username || "Unknown user");
      return `
        <article class="admin-event-row">
          <div>
            <strong>${event.title}</strong>
            <span>${event.category} | ${formatDate(event.event_date)} | ${countParticipants(event.event_id)}/${event.capacity} joined</span>
            <small>Registered: ${registeredUsers.length ? registeredUsers.join(", ") : "No users yet"}</small>
          </div>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-edit-event="${event.event_id}">Edit</button>
            <button class="danger-btn" type="button" data-delete-event="${event.event_id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function likeCount(postId) {
  return getPostLikes().filter((like) => Number(like.post_id) === Number(postId)).length;
}

function commentCount(postId) {
  return getPostComments().filter((comment) => (
    Number(comment.post_id) === Number(postId) && comment.status === "active"
  )).length;
}

function shareCount(postId) {
  return getPostShares().filter((share) => Number(share.post_id) === Number(postId)).length;
}

function postCardTemplate(post, options = {}) {
  const currentUser = getCurrentUser();
  const author = findUser(post.user_id);
  const canDelete = currentUser && (Number(currentUser.user_id) === Number(post.user_id) || currentUser.role === "admin");
  const liked = currentUser && getPostLikes().some((like) => (
    Number(like.post_id) === Number(post.post_id) && Number(like.user_id) === Number(currentUser.user_id)
  ));
  const comments = getPostComments().filter((comment) => (
    Number(comment.post_id) === Number(post.post_id) && comment.status === "active"
  ));

  return `
    <article class="post-card">
      <div class="post-topline">
        <button class="text-btn" type="button" data-view-user="${post.user_id}">${author?.username || "Unknown user"}</button>
        <span>${formatDateTime(post.created_at)}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="">` : ""}
      <div class="post-actions">
        <button class="secondary-btn ${liked ? "active" : ""}" type="button" data-like-post="${post.post_id}">
          ${liked ? "Liked" : "Like"} (${likeCount(post.post_id)})
        </button>
        <button class="secondary-btn" type="button" data-share-post="${post.post_id}">Share (${shareCount(post.post_id)})</button>
        ${canDelete ? `<button class="danger-btn" type="button" data-delete-post="${post.post_id}">Delete</button>` : ""}
      </div>
      ${options.hideComments ? "" : `
        <div class="comment-list">
          ${comments.length ? comments.map((comment) => `
            <p><strong>${findUser(comment.user_id)?.username || "Unknown"}:</strong> ${comment.comment_text}</p>
          `).join("") : "<p>No comments yet.</p>"}
        </div>
        <form class="inline-form" data-comment-form="${post.post_id}">
          <input type="text" name="comment_text" placeholder="Write a comment">
          <button class="dark-btn" type="submit">Comment (${commentCount(post.post_id)})</button>
        </form>
      `}
    </article>
  `;
}

function renderPosts() {
  const posts = getPosts()
    .filter((post) => post.status === "active")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  qs("#postFeed").innerHTML = posts.length
    ? posts.map((post) => postCardTemplate(post)).join("")
    : emptyStateTemplate("No posts yet.", "Create the first anime community post.");
}

function renderProfile() {
  const currentUser = getCurrentUser();
  const profileContent = qs("#profileContent");

  if (!currentUser) {
    profileContent.innerHTML = `
      <div class="profile-card">
        <p class="eyebrow">Profile</p>
        <h1>No user logged in</h1>
        <p class="muted">Login or sign up to view your profile, posts, and liked posts.</p>
        <button class="primary-btn" type="button" data-view-link="auth">Go to Log In / Sign Up</button>
      </div>
    `;
    return;
  }

  const myPosts = getPosts().filter((post) => (
    Number(post.user_id) === Number(currentUser.user_id) && post.status === "active"
  ));
  const likedIds = getPostLikes()
    .filter((like) => Number(like.user_id) === Number(currentUser.user_id))
    .map((like) => Number(like.post_id));
  const likedPosts = getPosts().filter((post) => likedIds.includes(Number(post.post_id)) && post.status === "active");
  const joinedCount = getRegistrations().filter((item) => (
    Number(item.user_id) === Number(currentUser.user_id) && item.status === "joined"
  )).length;

  profileContent.innerHTML = `
    <div class="profile-card">
      <p class="eyebrow">${currentUser.role === "admin" ? "Admin profile" : "User profile"}</p>
      <h1>${currentUser.username}</h1>
      <div class="profile-grid">
        <div><span>Email</span><strong>${currentUser.email}</strong></div>
        <div><span>Role</span><strong>${currentUser.role}</strong></div>
        <div><span>Anime Interest</span><strong>${currentUser.anime_interest || "Not set"}</strong></div>
        <div><span>Joined Events</span><strong>${joinedCount}</strong></div>
        <div><span>My Posts</span><strong>${myPosts.length}</strong></div>
        <div><span>Liked Posts</span><strong>${likedPosts.length}</strong></div>
      </div>
      <button class="dark-btn" type="button" id="logoutButton">Logout</button>
    </div>
    <section class="profile-section">
      <div class="section-heading compact"><h2>My Posts</h2></div>
      <div class="post-feed compact-feed">
        ${myPosts.length ? myPosts.map((post) => postCardTemplate(post, { hideComments: true })).join("") : emptyStateTemplate("No posts created yet.", "Create one from the Posts page.")}
      </div>
    </section>
    <section class="profile-section">
      <div class="section-heading compact"><h2>Liked Posts</h2></div>
      <div class="post-feed compact-feed">
        ${likedPosts.length ? likedPosts.map((post) => postCardTemplate(post, { hideComments: true })).join("") : emptyStateTemplate("No liked posts yet.", "Like posts from the community feed.")}
      </div>
    </section>
  `;
}

function renderAll() {
  renderNavigation();
  renderCategoryOptions();
  renderEvents();
  renderMyEvents();
  renderAdminEvents();
  renderPosts();
  renderProfile();
}

function viewAllowed(viewName) {
  const currentUser = getCurrentUser();
  if (viewName === "admin-events") return currentUser?.role === "admin";
  if (viewName === "home") return currentUser?.role !== "admin";
  return true;
}

function switchView(viewName) {
  const safeView = viewAllowed(viewName) ? viewName : (isAdmin() ? "events" : "home");
  state.currentView = safeView;

  qsa(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === safeView);
  });

  qsa("[data-view-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === safeView);
  });

  qs("#mainNav").classList.remove("open");
  qs(".nav-toggle").setAttribute("aria-expanded", "false");
  clearMessages();
  window.location.hash = safeView;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openEventModal(eventId) {
  const event = getEvents().find((item) => Number(item.event_id) === Number(eventId));
  if (!event) return;

  state.activeEventId = Number(eventId);
  const currentUser = getCurrentUser();
  const alreadyJoined = currentUser && activeRegistrations(event.event_id).some((item) => (
    Number(item.user_id) === Number(currentUser.user_id)
  ));
  const status = eventStatus(event);
  const registeredUsers = activeRegistrations(event.event_id)
    .map((registration) => findUser(registration.user_id))
    .filter(Boolean);
  const canJoin = currentUser?.role === "user" && !alreadyJoined && status === "Upcoming";

  qs("#modalContent").innerHTML = `
    <span class="category-tag">${event.category}</span>
    <h2 id="modalTitle">${event.title}</h2>
    <p class="modal-description">${event.description}</p>
    <dl class="modal-facts">
      <div><dt>Date</dt><dd>${formatDate(event.event_date)}</dd></div>
      <div><dt>Time</dt><dd>${formatTime(event.event_time)}</dd></div>
      <div><dt>Location</dt><dd>${event.location}</dd></div>
      <div><dt>Status</dt><dd>${status}</dd></div>
      <div><dt>Participants</dt><dd>${countParticipants(event.event_id)}/${event.capacity} joined</dd></div>
      <div><dt>Created By</dt><dd>${findUser(event.created_by)?.username || "Unknown admin"}</dd></div>
    </dl>
    ${isAdmin() ? `
      <div class="registered-panel">
        <strong>Registered Users</strong>
        ${registeredUsers.length ? registeredUsers.map((user) => `<p>${user.username} | ${user.email}</p>`).join("") : "<p>No users registered yet.</p>"}
      </div>
    ` : ""}
    <button class="primary-btn full-width" type="button" id="joinEventButton" ${canJoin ? "" : "disabled"}>
      ${alreadyJoined ? "Already Joined" : status === "Upcoming" ? "Join Event" : status}
    </button>
  `;

  qs("#eventModal").classList.add("open");
  qs("#eventModal").setAttribute("aria-hidden", "false");
}

function closeEventModal() {
  qs("#eventModal").classList.remove("open");
  qs("#eventModal").setAttribute("aria-hidden", "true");
  state.activeEventId = null;
}

function openUserModal(userId) {
  const user = findUser(userId);
  if (!user) return;

  const posts = getPosts().filter((post) => Number(post.user_id) === Number(user.user_id) && post.status === "active");
  qs("#userModalContent").innerHTML = `
    <p class="eyebrow">${user.role} profile</p>
    <h2 id="userModalTitle">${user.username}</h2>
    <dl class="modal-facts">
      <div><dt>Email</dt><dd>${user.email}</dd></div>
      <div><dt>Anime Interest</dt><dd>${user.anime_interest || "Not set"}</dd></div>
      <div><dt>Posts</dt><dd>${posts.length}</dd></div>
    </dl>
    <div class="post-feed compact-feed">
      ${posts.length ? posts.map((post) => postCardTemplate(post, { hideComments: true })).join("") : emptyStateTemplate("No posts yet.", "This user has not posted anything.")}
    </div>
  `;
  qs("#userModal").classList.add("open");
  qs("#userModal").setAttribute("aria-hidden", "false");
}

function closeUserModal() {
  qs("#userModal").classList.remove("open");
  qs("#userModal").setAttribute("aria-hidden", "true");
}

function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const user = {
    user_id: nextId(getUsers(), "user_id"),
    username: formData.get("username").trim(),
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password"),
    role: "user",
    anime_interest: formData.get("anime_interest").trim(),
    created_at: new Date().toISOString()
  };

  if (!user.username || !user.email || !user.password) {
    setMessage("#registerMessage", "Please fill in username, email, and password.", "error");
    return;
  }

  const users = getUsers();
  if (users.some((existingUser) => existingUser.email === user.email)) {
    setMessage("#registerMessage", "This email is already registered. Please login instead.", "error");
    return;
  }

  writeStorage(STORAGE_KEYS.users, [...users, user]);
  setCurrentUser(user);
  form.reset();
  showToast("User account created.");
  renderAll();
  switchView("profile");
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = formData.get("email").trim().toLowerCase();
  const password = formData.get("password");

  if (!email || !password) {
    setMessage("#loginMessage", "Please enter both email and password.", "error");
    return;
  }

  const user = getUsers().find((item) => item.email === email && item.password === password);
  if (!user) {
    setMessage("#loginMessage", "Invalid demo login. Please check your email and password.", "error");
    return;
  }

  setCurrentUser(user);
  form.reset();
  showToast(`Logged in as ${user.role}.`);
  renderAll();
  switchView(user.role === "admin" ? "admin-events" : "home");
}

function handleEventForm(event) {
  event.preventDefault();
  if (!isAdmin()) {
    setMessage("#eventMessage", "Only admin can save events.", "error");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const eventId = formData.get("event_id");
  const eventRecord = {
    event_id: eventId ? Number(eventId) : nextId(getEvents(), "event_id"),
    title: formData.get("title").trim(),
    category: formData.get("category"),
    description: formData.get("description").trim(),
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time"),
    location: formData.get("location").trim(),
    capacity: Number(formData.get("capacity")),
    image_url: formData.get("image_url").trim(),
    status: formData.get("status"),
    created_by: getCurrentUser().user_id,
    created_at: eventId
      ? getEvents().find((item) => Number(item.event_id) === Number(eventId))?.created_at || new Date().toISOString()
      : new Date().toISOString()
  };

  if (!eventRecord.title || !eventRecord.category || !eventRecord.description || !eventRecord.event_date || !eventRecord.event_time || !eventRecord.location || !eventRecord.capacity) {
    setMessage("#eventMessage", "Please fill in all required event fields.", "error");
    return;
  }

  const events = getEvents();
  const nextEvents = eventId
    ? events.map((item) => Number(item.event_id) === Number(eventId) ? eventRecord : item)
    : [eventRecord, ...events];

  writeStorage(STORAGE_KEYS.events, nextEvents);
  resetEventForm();
  showToast(eventId ? "Event updated." : "Event created.");
  renderAll();
}

function resetEventForm() {
  const form = qs("#eventForm");
  form.reset();
  form.elements.namedItem("event_id").value = "";
  qs("#eventFormMode").textContent = "Create Event";
  setMessage("#eventMessage", "");
}

function editEvent(eventId) {
  const event = getEvents().find((item) => Number(item.event_id) === Number(eventId));
  if (!event) return;

  const form = qs("#eventForm");
  form.elements.namedItem("event_id").value = event.event_id;
  form.elements.namedItem("title").value = event.title;
  form.elements.namedItem("category").value = event.category;
  form.elements.namedItem("event_date").value = event.event_date;
  form.elements.namedItem("event_time").value = event.event_time;
  form.elements.namedItem("capacity").value = event.capacity;
  form.elements.namedItem("status").value = event.status;
  form.elements.namedItem("location").value = event.location;
  form.elements.namedItem("image_url").value = event.image_url;
  form.elements.namedItem("description").value = event.description;
  qs("#eventFormMode").textContent = "Edit Event";
  switchView("admin-events");
}

function deleteEvent(eventId) {
  const events = getEvents().map((event) => (
    Number(event.event_id) === Number(eventId) ? { ...event, status: "Deleted" } : event
  ));
  writeStorage(STORAGE_KEYS.events, events);
  showToast("Event deleted.");
  renderAll();
}

function handleJoinEvent() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    closeEventModal();
    showToast("Please login before joining an event.");
    switchView("auth");
    return;
  }

  if (currentUser.role !== "user") {
    showToast("Only normal users can register events.");
    return;
  }

  const event = getEvents().find((item) => Number(item.event_id) === Number(state.activeEventId));
  if (!event || eventStatus(event) !== "Upcoming") {
    showToast("This event is not open for registration.");
    return;
  }

  const registrations = getRegistrations();
  const existing = registrations.find((item) => (
    Number(item.user_id) === Number(currentUser.user_id) && Number(item.event_id) === Number(state.activeEventId)
  ));

  const nextRegistrations = existing
    ? registrations.map((item) => item === existing ? { ...item, status: "joined", registration_date: new Date().toISOString() } : item)
    : [
        ...registrations,
        {
          registration_id: nextId(registrations, "registration_id"),
          user_id: currentUser.user_id,
          event_id: state.activeEventId,
          registration_date: new Date().toISOString(),
          status: "joined"
        }
      ];

  writeStorage(STORAGE_KEYS.registrations, nextRegistrations);
  showToast("Event joined successfully.");
  closeEventModal();
  renderAll();
}

function cancelRegistration(eventId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const registrations = getRegistrations().map((item) => (
    Number(item.user_id) === Number(currentUser.user_id) && Number(item.event_id) === Number(eventId)
      ? { ...item, status: "cancelled" }
      : item
  ));

  writeStorage(STORAGE_KEYS.registrations, registrations);
  showToast("Registration cancelled.");
  renderAll();
}

function handlePostForm(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    setMessage("#postMessage", "Please login before creating a post.", "error");
    switchView("auth");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const title = formData.get("title").trim();
  const content = formData.get("content").trim();
  const imageUrl = formData.get("image_url").trim();

  if (!title || !content) {
    setMessage("#postMessage", "Please fill in post title and content.", "error");
    return;
  }

  const posts = getPosts();
  writeStorage(STORAGE_KEYS.posts, [
    {
      post_id: nextId(posts, "post_id"),
      user_id: currentUser.user_id,
      title,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "active"
    },
    ...posts
  ]);

  form.reset();
  showToast("Post created.");
  renderAll();
}

function toggleLike(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Please login before liking posts.");
    switchView("auth");
    return;
  }

  const likes = getPostLikes();
  const existing = likes.find((like) => (
    Number(like.post_id) === Number(postId) && Number(like.user_id) === Number(currentUser.user_id)
  ));
  const nextLikes = existing
    ? likes.filter((like) => like !== existing)
    : [...likes, { like_id: nextId(likes, "like_id"), post_id: Number(postId), user_id: currentUser.user_id, created_at: new Date().toISOString() }];

  writeStorage(STORAGE_KEYS.postLikes, nextLikes);
  renderAll();
}

function sharePost(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Please login before sharing posts.");
    switchView("auth");
    return;
  }

  const shares = getPostShares();
  writeStorage(STORAGE_KEYS.postShares, [
    ...shares,
    {
      share_id: nextId(shares, "share_id"),
      post_id: Number(postId),
      user_id: currentUser.user_id,
      share_message: "",
      created_at: new Date().toISOString()
    }
  ]);
  showToast("Post shared in demo data.");
  renderAll();
}

function deletePost(postId) {
  const currentUser = getCurrentUser();
  const post = getPosts().find((item) => Number(item.post_id) === Number(postId));
  if (!currentUser || !post) return;

  const canDelete = currentUser.role === "admin" || Number(currentUser.user_id) === Number(post.user_id);
  if (!canDelete) {
    showToast("You can only delete your own post.");
    return;
  }

  writeStorage(STORAGE_KEYS.posts, getPosts().map((item) => (
    Number(item.post_id) === Number(postId) ? { ...item, status: "deleted", updated_at: new Date().toISOString() } : item
  )));
  showToast("Post deleted.");
  renderAll();
}

function handleCommentForm(event, form, postId) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Please login before commenting.");
    switchView("auth");
    return;
  }

  const input = form.elements.namedItem("comment_text");
  const text = input.value.trim();
  if (!text) return;

  const comments = getPostComments();
  writeStorage(STORAGE_KEYS.postComments, [
    ...comments,
    {
      comment_id: nextId(comments, "comment_id"),
      post_id: Number(postId),
      user_id: currentUser.user_id,
      comment_text: text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "active"
    }
  ]);
  input.value = "";
  renderAll();
}

function fillLogin(role) {
  const form = qs("#loginForm");
  const account = role === "admin"
    ? { email: "admin@example.com", password: "admin123" }
    : { email: "student@example.com", password: "student123" };

  form.elements.namedItem("email").value = account.email;
  form.elements.namedItem("password").value = account.password;
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewLink = event.target.closest("[data-view-link]");
    if (viewLink) {
      event.preventDefault();
      switchView(viewLink.dataset.viewLink);
      return;
    }

    const eventDetails = event.target.closest("[data-event-details]");
    if (eventDetails) {
      openEventModal(eventDetails.dataset.eventDetails);
      return;
    }

    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.selectedCategory = categoryButton.dataset.category;
      renderCategoryOptions();
      renderEvents();
      return;
    }

    const editButton = event.target.closest("[data-edit-event]");
    if (editButton) {
      editEvent(editButton.dataset.editEvent);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-event]");
    if (deleteButton) {
      deleteEvent(deleteButton.dataset.deleteEvent);
      return;
    }

    const cancelButton = event.target.closest("[data-cancel-registration]");
    if (cancelButton) {
      cancelRegistration(cancelButton.dataset.cancelRegistration);
      return;
    }

    const likeButton = event.target.closest("[data-like-post]");
    if (likeButton) {
      toggleLike(likeButton.dataset.likePost);
      return;
    }

    const shareButton = event.target.closest("[data-share-post]");
    if (shareButton) {
      sharePost(shareButton.dataset.sharePost);
      return;
    }

    const deletePostButton = event.target.closest("[data-delete-post]");
    if (deletePostButton) {
      deletePost(deletePostButton.dataset.deletePost);
      return;
    }

    const viewUserButton = event.target.closest("[data-view-user]");
    if (viewUserButton) {
      openUserModal(viewUserButton.dataset.viewUser);
      return;
    }

    const fillLoginButton = event.target.closest("[data-fill-login]");
    if (fillLoginButton) {
      fillLogin(fillLoginButton.dataset.fillLogin);
      return;
    }

    if (event.target.id === "logoutButton") {
      setCurrentUser(null);
      showToast("Logged out.");
      renderAll();
      switchView("home");
      return;
    }

    if (event.target.id === "joinEventButton") {
      handleJoinEvent();
    }
  });

  document.addEventListener("submit", (event) => {
    const commentForm = event.target.closest("[data-comment-form]");
    if (commentForm) {
      handleCommentForm(event, commentForm, commentForm.dataset.commentForm);
    }
  });

  qs(".nav-toggle").addEventListener("click", () => {
    const nav = qs("#mainNav");
    const isOpen = nav.classList.toggle("open");
    qs(".nav-toggle").setAttribute("aria-expanded", String(isOpen));
  });

  qs(".modal-close").addEventListener("click", closeEventModal);
  qs("[data-close-user-modal]").addEventListener("click", closeUserModal);
  qs("#eventModal").addEventListener("click", (event) => {
    if (event.target.id === "eventModal") closeEventModal();
  });
  qs("#userModal").addEventListener("click", (event) => {
    if (event.target.id === "userModal") closeUserModal();
  });

  qs("#registerForm").addEventListener("submit", handleRegister);
  qs("#loginForm").addEventListener("submit", handleLogin);
  qs("#eventForm").addEventListener("submit", handleEventForm);
  qs("#postForm").addEventListener("submit", handlePostForm);
  qs("#resetEventForm").addEventListener("click", resetEventForm);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEventModal();
      closeUserModal();
    }
  });
}

function bootApp() {
  initializeStorage();
  bindEvents();
  renderAll();

  const initialView = window.location.hash.replace("#", "") || (isAdmin() ? "events" : "home");
  const validView = qs(`[data-view="${initialView}"]`) ? initialView : "home";
  switchView(validView);
}

bootApp();

const STORAGE_KEYS = {
  users: "taeh_users",
  currentUser: "taeh_currentUser",
  events: "taeh_events",
  joinedEvents: "taeh_joinedEvents"
};

const state = {
  currentView: "home",
  selectedCategory: "All",
  activeEventId: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

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
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeStorage(STORAGE_KEYS.users, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.joinedEvents)) {
    writeStorage(STORAGE_KEYS.joinedEvents, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.events)) {
    writeStorage(STORAGE_KEYS.events, window.TAEH_DEFAULT_EVENTS || []);
  }
}

function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function getEvents() {
  return readStorage(STORAGE_KEYS.events, []);
}

function getJoinedEvents() {
  return readStorage(STORAGE_KEYS.joinedEvents, []);
}

function getCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }

  writeStorage(STORAGE_KEYS.currentUser, {
    id: user.id,
    fullName: user.fullName,
    studentId: user.studentId,
    email: user.email
  });
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

function countParticipants(eventId) {
  const event = getEvents().find((item) => item.id === eventId);
  const joinedCount = getJoinedEvents().filter((item) => item.eventId === eventId).length;
  return (event?.baseParticipants || 0) + joinedCount;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setMessage(elementId, message, type = "neutral") {
  const element = $(elementId);
  element.textContent = message;
  element.dataset.type = type;
}

function clearMessages() {
  ["#registerMessage", "#loginMessage", "#createMessage"].forEach((selector) => {
    const element = $(selector);
    if (element) {
      element.textContent = "";
      element.dataset.type = "neutral";
    }
  });
}

function renderCategoryOptions() {
  const createCategory = $("#createCategory");
  createCategory.innerHTML = window.TAEH_CATEGORIES
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  const filters = ["All", ...window.TAEH_CATEGORIES];
  $("#categoryFilters").innerHTML = filters
    .map((category) => `
      <button class="filter-pill ${category === state.selectedCategory ? "active" : ""}" type="button" data-category="${category}">
        ${category}
      </button>
    `)
    .join("");
}

function eventCardTemplate(event, options = {}) {
  const participants = countParticipants(event.id);
  const compactClass = options.compact ? " compact-card" : "";

  return `
    <article class="event-card${compactClass}">
      <div class="event-art ${event.category.toLowerCase().replace(/\s+/g, "-")}">
        <span>${event.category}</span>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span class="category-tag">${event.category}</span>
          <span>${participants} joined</span>
        </div>
        <h3>${event.title}</h3>
        <p>${event.shortDescription || event.description}</p>
        <dl class="event-facts">
          <div>
            <dt>Date</dt>
            <dd>${formatDate(event.date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>${formatTime(event.time)}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>${event.location}</dd>
          </div>
        </dl>
        <button class="secondary-btn" type="button" data-event-details="${event.id}">View Details</button>
      </div>
    </article>
  `;
}

function renderEvents() {
  const events = getEvents();
  const filteredEvents = state.selectedCategory === "All"
    ? events
    : events.filter((event) => event.category === state.selectedCategory);

  $("#eventsGrid").innerHTML = filteredEvents.length
    ? filteredEvents.map((event) => eventCardTemplate(event)).join("")
    : emptyStateTemplate("No events match this category yet.", "Try another category or create a new event.");

  $("#featuredEvents").innerHTML = events
    .slice(0, 3)
    .map((event) => eventCardTemplate(event, { compact: true }))
    .join("");
}

function emptyStateTemplate(title, detail) {
  return `
    <div class="empty-state">
      <strong>${title}</strong>
      <p>${detail}</p>
    </div>
  `;
}

function renderMyEvents() {
  const currentUser = getCurrentUser();
  const joinedContainer = $("#joinedEvents");
  const createdContainer = $("#createdEvents");

  if (!currentUser) {
    const loginPrompt = emptyStateTemplate("Login required", "Create or login to a demo account to view your events.");
    joinedContainer.innerHTML = loginPrompt;
    createdContainer.innerHTML = loginPrompt;
    return;
  }

  const events = getEvents();
  const joinedIds = getJoinedEvents()
    .filter((item) => item.userId === currentUser.id)
    .map((item) => item.eventId);
  const joinedEvents = events.filter((event) => joinedIds.includes(event.id));
  const createdEvents = events.filter((event) => event.createdBy === currentUser.id);

  joinedContainer.innerHTML = joinedEvents.length
    ? joinedEvents.map((event) => eventCardTemplate(event, { compact: true })).join("")
    : emptyStateTemplate("No joined events yet.", "Browse events and join one to see it here.");

  createdContainer.innerHTML = createdEvents.length
    ? createdEvents.map((event) => eventCardTemplate(event, { compact: true })).join("")
    : emptyStateTemplate("No created events yet.", "Create your first campus anime event.");
}

function renderProfile() {
  const currentUser = getCurrentUser();
  const profileContent = $("#profileContent");

  if (!currentUser) {
    profileContent.innerHTML = `
      <div class="profile-card">
        <p class="eyebrow">Profile</p>
        <h1>No user logged in</h1>
        <p class="muted">Login or register to view your demo student profile.</p>
        <button class="primary-btn" type="button" data-view-link="auth">Go to Login/Register</button>
      </div>
    `;
    return;
  }

  const joinedCount = getJoinedEvents().filter((item) => item.userId === currentUser.id).length;
  const createdCount = getEvents().filter((event) => event.createdBy === currentUser.id).length;

  profileContent.innerHTML = `
    <div class="profile-card">
      <p class="eyebrow">Logged-in student</p>
      <h1>${currentUser.fullName}</h1>
      <div class="profile-grid">
        <div>
          <span>Student ID</span>
          <strong>${currentUser.studentId}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>${currentUser.email}</strong>
        </div>
        <div>
          <span>Joined Events</span>
          <strong>${joinedCount}</strong>
        </div>
        <div>
          <span>Created Events</span>
          <strong>${createdCount}</strong>
        </div>
      </div>
      <button class="dark-btn" type="button" id="logoutButton">Logout</button>
    </div>
  `;
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  const authLink = $("[data-auth-link]");
  authLink.textContent = currentUser ? currentUser.fullName.split(" ")[0] : "Login/Register";
}

function renderAll() {
  renderCategoryOptions();
  renderEvents();
  renderMyEvents();
  renderProfile();
  renderAuthState();
}

function switchView(viewName) {
  state.currentView = viewName;

  $$(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewName);
  });

  $$("[data-view-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === viewName);
  });

  $("#mainNav").classList.remove("open");
  $(".nav-toggle").setAttribute("aria-expanded", "false");
  clearMessages();
  renderMyEvents();
  renderProfile();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openEventModal(eventId) {
  const event = getEvents().find((item) => item.id === eventId);
  if (!event) return;

  state.activeEventId = eventId;
  const currentUser = getCurrentUser();
  const alreadyJoined = currentUser && getJoinedEvents().some((item) => (
    item.userId === currentUser.id && item.eventId === eventId
  ));

  $("#modalContent").innerHTML = `
    <span class="category-tag">${event.category}</span>
    <h2 id="modalTitle">${event.title}</h2>
    <p class="modal-description">${event.description}</p>
    <dl class="modal-facts">
      <div><dt>Date</dt><dd>${formatDate(event.date)}</dd></div>
      <div><dt>Time</dt><dd>${formatTime(event.time)}</dd></div>
      <div><dt>Location</dt><dd>${event.location}</dd></div>
      <div><dt>Participants</dt><dd>${countParticipants(event.id)} joined</dd></div>
    </dl>
    <button class="primary-btn full-width" type="button" id="joinEventButton">
      ${alreadyJoined ? "Already Joined" : "Join Event"}
    </button>
  `;

  const joinButton = $("#joinEventButton");
  joinButton.disabled = Boolean(alreadyJoined);

  $("#eventModal").classList.add("open");
  $("#eventModal").setAttribute("aria-hidden", "false");
}

function closeEventModal() {
  $("#eventModal").classList.remove("open");
  $("#eventModal").setAttribute("aria-hidden", "true");
  state.activeEventId = null;
}

function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const user = {
    id: `user-${Date.now()}`,
    fullName: formData.get("fullName").trim(),
    studentId: formData.get("studentId").trim(),
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password")
  };

  if (!user.fullName || !user.studentId || !user.email || !user.password) {
    setMessage("#registerMessage", "Please fill in all registration fields.", "error");
    return;
  }

  const users = getUsers();
  if (users.some((existingUser) => existingUser.email === user.email)) {
    setMessage("#registerMessage", "This email is already registered. Please login instead.", "error");
    return;
  }

  users.push(user);
  writeStorage(STORAGE_KEYS.users, users);
  setCurrentUser(user);
  form.reset();
  setMessage("#registerMessage", "Account created. You are now logged in.", "success");
  showToast("Welcome to Taylor's Anime Event Hub.");
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
  setMessage("#loginMessage", "Login successful.", "success");
  showToast("Login successful.");
  renderAll();
  switchView("profile");
}

function handleCreateEvent(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    setMessage("#createMessage", "Please login before creating an event.", "error");
    switchView("auth");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const title = formData.get("title").trim();
  const category = formData.get("category");
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location").trim();
  const description = formData.get("description").trim();

  if (!title || !category || !date || !time || !location || !description) {
    setMessage("#createMessage", "Please fill in all event fields.", "error");
    return;
  }

  const eventRecord = {
    id: `evt-${Date.now()}`,
    title,
    category,
    date,
    time,
    location,
    shortDescription: description.length > 110 ? `${description.slice(0, 110)}...` : description,
    description,
    baseParticipants: 0,
    createdBy: currentUser.id
  };

  writeStorage(STORAGE_KEYS.events, [eventRecord, ...getEvents()]);
  form.reset();
  setMessage("#createMessage", "Event created successfully.", "success");
  showToast("Event created and added to the hub.");
  renderAll();
  switchView("events");
}

function handleJoinEvent() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    closeEventModal();
    showToast("Please login before joining an event.");
    switchView("auth");
    return;
  }

  const joinedEvents = getJoinedEvents();
  const alreadyJoined = joinedEvents.some((item) => (
    item.userId === currentUser.id && item.eventId === state.activeEventId
  ));

  if (alreadyJoined) {
    showToast("You already joined this event.");
    return;
  }

  joinedEvents.push({
    userId: currentUser.id,
    eventId: state.activeEventId,
    joinedAt: new Date().toISOString()
  });

  writeStorage(STORAGE_KEYS.joinedEvents, joinedEvents);
  showToast("Event joined successfully.");
  closeEventModal();
  renderAll();
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

  $(".nav-toggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const isOpen = nav.classList.toggle("open");
    $(".nav-toggle").setAttribute("aria-expanded", String(isOpen));
  });

  $(".modal-close").addEventListener("click", closeEventModal);
  $("#eventModal").addEventListener("click", (event) => {
    if (event.target.id === "eventModal") closeEventModal();
  });

  $("#registerForm").addEventListener("submit", handleRegister);
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#createEventForm").addEventListener("submit", handleCreateEvent);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeEventModal();
  });
}

function bootApp() {
  initializeStorage();
  bindEvents();
  renderAll();

  const initialView = window.location.hash.replace("#", "") || "home";
  const validView = $(`[data-view="${initialView}"]`) ? initialView : "home";
  switchView(validView);
}

bootApp();

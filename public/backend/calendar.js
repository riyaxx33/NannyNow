// Import Firebase services from firebase-config.js
import { auth, db } from "./firebase-config.js";
import {
  doc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // Define userId globally
  let userId = null;

  // Initialise events object globally
  let events = {};

  let currentDate = new Date();

  // Monitor authentication state
  onAuthStateChanged(auth, (user) => {
    // User is logged in
    if (user) {
      userId = user.uid;
      // Load events only if user is authenticated
      loadUserEvents(userId);
    } else {
      // User is not logged in; redirect to login page
      window.location.href = "../login_page.html";
    }
  });

  // Fetch and display user's events from Firebase
  async function loadUserEvents() {
    const userDoc = doc(db, "users", userId);
    onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        // load events
        events = docSnap.data().events || {};

        // render calendar with loaded events
        renderCalendar(events);
      } else {
        console.log("No user document found.");
        events = {};
        renderCalendar(events);
      }
    });
  }

  // renderCalendar(events);

  function renderCalendar(events) {
    console.log("Rendering Calendar for:", currentDate);

    const calendarGrid = document.getElementById("calendar-grid");
    const monthYear = document.getElementById("month-year");

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Calculate the number of days in a month
    const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let firstDayOfMonth = new Date(year, month, 1).getDay();

    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Get the number of days in the month
    let numDays = daysInMonth(month + 1, year);

    // Clear previous days
    while (calendarGrid.firstChild) {
      calendarGrid.removeChild(calendarGrid.firstChild);
    }

    // Fill empty slots before the 1st day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      let emptySlot = document.createElement("div");
      emptySlot.className = "col empty";
      calendarGrid.appendChild(emptySlot);
    }

    // Get today's date
    let today = new Date();
    let isToday = year === today.getFullYear() && month === today.getMonth();

    // Generate days
    for (let day = 1; day <= numDays; day++) {
      let dayElement = document.createElement("div");
      dayElement.className = "col day text-center border py-2";

      // Check if this say is today and apply a special class
      if (isToday && day === today.getDate()) {
        dayElement.classList.add("today");
      }

      dayElement.textContent = day;

      if (!events) {
        events = {};
      }

      // Display event if exists
      const eventKey = `${year}-${month + 1}-${day}`;
      if (events[eventKey]) {
        let eventDiv = document.createElement("div");
        eventDiv.className = "event";
        eventDiv.textContent = events[eventKey];
        dayElement.appendChild(eventDiv);
      }

      dayElement.addEventListener("click", () =>
        openModal(year, month + 1, day)
      );
      calendarGrid.appendChild(dayElement);
    }
  }

  function openModal(year, month, day) {
    var modal = new bootstrap.Modal(document.getElementById("event-modal"));
    const eventDate = document.getElementById("event-date");
    eventDate.value = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    modal.show();
  }

  const eventForm = document.getElementById("event-form");
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("User is not authenticated. Cannot save event.");
      alert("You must be logged in to add an event.");
      return; // Exit if not authenticated
    }

    const eventTitle = document.getElementById("event-title");
    const eventDate = document.getElementById("event-date");
    const title = eventTitle.value;
    const date = eventDate.value;

    // Store event
    events[date] = title;

    // Save event to Firebase
    try {
      const userDoc = doc(db, "users", userId);
      const eventData = { [`events.${date}`]: title };
      await setDoc(userDoc, { events }, { merge: true });
      alert(`Event: ${title} added on ${date}`);
      bootstrap.Modal.getInstance(
        document.getElementById("event-modal")
      ).hide();
      renderCalendar(events);
    } catch (error) {
      console.error("Error saving event: ", error);
    }
  });

  // Add event listeners for the navigation buttons
  document.getElementById("prev-month").addEventListener("click", () => {
    console.log("Previous month:", currentDate);
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    console.log("Next month:", currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // renderCalendar();
});

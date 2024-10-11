document.addEventListener("DOMContentLoaded", function () {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthYear = document.getElementById("month-year");
  var modal = new bootstrap.Modal(document.getElementById("event-modal"));
  const eventForm = document.getElementById("event-form");
  const eventTitle = document.getElementById("event-title");
  const eventDate = document.getElementById("event-date");

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

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  let currentDate = new Date();

  // Calculate the number of days in a month
  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

  function renderCalendar() {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let firstDayOfMonth = new Date(year, month, 1).getDay();

    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Get the number of days in the month
    let numDays = daysInMonth(month, year);

    // Clear previous days
    while (calendarGrid.firstChild) {
      calendarGrid.removeChild(calendarGrid.firstChild);
    }

    // Add day labels
    daysOfWeek.forEach((day) => {
      let dayLabel = document.createElement("div");
      dayLabel.className = "col fw-bold text-center";
      dayLabel.textContent = day;
      calendarGrid.appendChild(dayLabel);
    });

    // Fill empty slots before the 1st day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      let emptySlot = document.createElement("div");
      emptySlot.className = "col empty";
      calendarGrid.appendChild(emptySlot);
    }

    // Generate days
    for (let day = 1; day <= numDays; day++) {
      let dayElement = document.createElement("div");
      dayElement.className = "col day text-center border py-2";
      dayElement.textContent = day;
      dayElement.addEventListener("click", () =>
        openModal(year, month + 1, day)
      );
      calendarGrid.appendChild(dayElement);
    }
  }

  function openModal(year, month, day) {
    eventDate.value = `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
    modal.show();
  }

  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = eventTitle.value;
    const date = eventDate.value;
    alert(`Event: ${title}\nDate: ${date}`);
    modal.hide();
  });

  // Add event listeners for the navigation buttons
  document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});

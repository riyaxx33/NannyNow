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

  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
  let currentDate = new Date();

  function renderCalendar() {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1; // Months are 0-indexed

    monthYear.textContent = `${monthNames[month - 1]} ${year}`;

    // Get the number of days in the month
    let numDays = daysInMonth(month, year);

    // Clear previous days
    while (calendarGrid.firstChild) {
      calendarGrid.removeChild(calendarGrid.firstChild);
    }

    // Generate days
    for (let day = 1; day <= numDays; day++) {
      let dayElement = document.createElement("div");
      dayElement.className = "col day";
      dayElement.textContent = day;
      dayElement.addEventListener("click", () => openModal(year, month, day));
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

  renderCalendar();
});

// const container = document.getElementById("calendar");
// const form = document.getElementById("activity-form");
// const formDiv = document.getElementById("activity-form-container");
// const calendarHeader = document.getElementById("calendar-header");
// const colHeaders = document.getElementsByClassName("colHeader");
// const lastWeek = document.getElementById("last-week");
// const nextWeek = document.getElementById("next-week");

// // Active variables
// let elementsEnabled = true;
// let inputSelected = null;
// let currentTask = null;
// let currentWeek = null;
// let inputs = null;
// let currentDayInputs = null;
// const activeTimeSlots = [];
// const activities = [];

// // HTML objecst for modal
// const activitySaveButton = document.getElementById("activity-submit");
// const activityCancelButton = document.getElementById("activity-cancel");
// const activitySaveModalButton = document.getElementById("activity-save");
// const activityCancelSaveModalButton = document.getElementById("activity-cancel-save");
// const activityEditButton = document.getElementById("activity-edit");
// const activityDeleteButton = document.getElementById("activity-delete");
// const activityCloseButton = document.getElementById("activity-close");
// const activityName = document.getElementById("activity-name");
// const activityDuration = document.getElementById("activity-duration");
// const activityLocation = document.getElementById("activity-location");
// const activityDescription = document.getElementById("activity-description");

// // Colors for modals
// const colors = ["grey", "red", "orange", "yellow", "green", "blue", "purple", "pink"];
// const greyButton = document.getElementById("grey");
// const redButton = document.getElementById("red");
// const orangeButton = document.getElementById("orange");
// const yellowButton = document.getElementById("yellow");
// const greenButton = document.getElementById("green");
// const blueButton = document.getElementById("blue");
// const purpleButton = document.getElementById("purple");
// const pinkButton = document.getElementById("pink");
// const colorButtons = [greyButton, redButton, orangeButton, yellowButton, greenButton, blueButton, purpleButton, pinkButton];

// // Date and time formatting options
// const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
// const currentDay = new Intl.DateTimeFormat("en-US", {weekday: 'long'}).format(new Date()).toLowerCase();
// const currentMonth = new Intl.DateTimeFormat("en-US", {month: 'long'}).format(new Date()).toLowerCase();

// // Setting the dates
// const date = new Date();
// const newDate = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1))); // Getting start of the week
// const week = new Intl.DateTimeFormat("en-US", options).format(newDate);

// // Local storage data array
// const weeklyData = localStorage.getItem("weeklyData") ? JSON.parse(localStorage.getItem("weeklyData")) : {};
// let taskData = [];

// // Function to create an array of all the weeks in the current year
// const getWeeksInYear = (year) => {
//   const weeks = [];
//   let startDate = new Date(year, 0, 1); // January 1st of the given year

//   // Adjust start date to the first Monday of the year
//   while (startDate.getDay() !== 1) {
//     startDate.setDate(startDate.getDate() + 1);
//   }

//   while (startDate.getFullYear() === year) {
//     const endDate = new Date(startDate); // Copy start date
//     endDate.setDate(endDate.getDate() + 6); // End of the week

//     weeks.push({
//       week: new Intl.DateTimeFormat("en-US", options).format(startDate),
//     });

//     // Move start date to the next week
//     startDate.setDate(startDate.getDate() + 7);
//   }
//   return weeks;
// }
// const weeks = getWeeksInYear(Number(new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(new Date())));



// Upon loading the window, create the calendar
window.onload = () => {
    createWeek();
    loadStorage();
}

// Create the calendar module
const createWeek = () => {
    
    // Create the weeks array and the the current week
    weeks.forEach(weekStart => {

        if (weekStart.week === week) {
            currentWeek = week;
        }
    });
    taskData = weeklyData[currentWeek] || [];
    calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;

    // Creating columns to be days of the week, and rows to be 30-minute time slots
    const timeSlots = generateHoursInterval(60*7, 60 * 24, 30);
    const daysOfTheWeek = [];
    let startOfTheWeek = newDate.getDate();
    for (let i = 0; i<7; i++){
        date.setDate(startOfTheWeek + i);
        daysOfTheWeek.push({date: Number(date.getDate()), day: new Intl.DateTimeFormat("en-US", {weekday: 'long'}).format(date)});
    }

    // Getting the current time approximation 
    const currentTime = new Intl.DateTimeFormat("en-US", {hour: '2-digit', minute: '2-digit', hour12: true}).format(new Date());
    let currentTimeApproximation = null;
    timeSlots.forEach(time => {
        const hourOne = time.slice(0,2);
        const amPmOne = time.slice(-2);
        const hourTwo = currentTime.slice(0,2)
        const minuteTwo = Number(currentTime.slice(3,5))
        const amPmTwo = currentTime.slice(-2);

        if (amPmOne === amPmTwo && hourOne === hourTwo) {
            minuteTwo < 30 ? currentTimeApproximation = `${hourTwo}:00 ${amPmTwo}` : currentTimeApproximation = `${hourTwo}:30 ${amPmTwo}`; 
        }
        
    });

    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        if (rowCol === "row"){
            title === currentTimeApproximation ? label.classList.add("rowHeader", title.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, '$1-$2-$3'), "current-time") : label.classList.add("rowHeader", title.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, '$1-$2-$3'));
            label.innerHTML = `<p>${title}</p>`;
        }
        else {
            title.day.toLowerCase() === currentDay ? label.classList.add("colHeader", "sticky", title.day.toLowerCase(), "current-day") : label.classList.add("colHeader", "sticky", title.day.toLowerCase())
            label.innerHTML = `
            <h6>${title.date < 10 ? '0' + title.date : title.date}</h6>
            <p id="${currentMonth}-${title.date}">${title.day}</p>
            `;
        }
        container.appendChild(label);
    }

    // Create a header label for every day fo the week
    daysOfTheWeek.forEach(createLabel, "col");

    // Create a label for every timeSlot and  create an input for dayOfTheWeek
    timeSlots.forEach(time => {
        
        createLabel(time, "row")
        daysOfTheWeek.forEach(day => {
            const input = document.createElement("span");
            const timeCleaned = time.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, '$1-$2-$3')
            // input.type = "text";
            input.id = `${day.day.toLowerCase()}-${timeCleaned}`;
            time.slice(3,5) === "30" ? input.className = "hour-mark" : input.className = "half-hour-mark";
            input.classList.add(day.day.toLowerCase(), "timeslot", "hover", timeCleaned)
            day.day.toLowerCase() === currentDay ? input.classList.add("current-day") : null;
            time === currentTimeApproximation ? input.classList.add("current-time") : null;
            input.ariaLabel = `${day.day.toLowerCase()}-${timeCleaned}`;
            input.onclick = update;
            container.appendChild(input);
        })
    })

    // Create element with all the spans that were created
    inputs = document.querySelectorAll("span");
    currentDayInputs = document.querySelectorAll(".current-day, .current-time");
}
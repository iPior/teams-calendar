import * as constants from './modules/constants.js';
import {generateHoursInterval, updateColumnHeaders} from './modules/utilities.js';
import {openModal, loadStorage, unloadOldStorage, weeklyData } from  './modules/modal.js'

// Upon loading the window, create the calendar
window.onload = () => {
    createWeek();
    loadStorage();
}

// Create the calendar module
const createWeek = () => {
    constants.currentWeek.innerText = constants.week;

    // Creating columns to be days of the week, and rows to be 30-minute time slots
    const date = new Date();
    const timeSlots = generateHoursInterval(60*7, 60 * 24, 30);
    const daysOfTheWeek = [];
    let startOfTheWeek = new Date(constants.newDate).getDate();
    for (let i = 0; i<7; i++){
        let tempDate = new Date(constants.newDate); // Clone the start of the week
        tempDate.setDate(constants.newDate.getDate() + i); // Add days incrementally
        
        daysOfTheWeek.push({date: Number(tempDate.getDate()), day: new Intl.DateTimeFormat("en-US", {weekday: 'long'}).format(tempDate)});
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
        if (amPmOne === amPmTwo && hourOne === hourTwo) minuteTwo < 30 ? currentTimeApproximation = `${hourTwo}:00 ${amPmTwo}` : currentTimeApproximation = `${hourTwo}:30 ${amPmTwo}`;
    });

    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        if (rowCol === "row"){
            title === currentTimeApproximation ? label.classList.add("rowHeader", title.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, '$1-$2-$3'), "current-time") : label.classList.add("rowHeader", title.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, '$1-$2-$3'));
            label.innerHTML = `<p>${title}</p>`;
        }
        else {
            title.day.toLowerCase() === constants.currentDay ? label.classList.add("colHeader", "sticky", title.day.toLowerCase(), "current-day") : label.classList.add("colHeader", "sticky", title.day.toLowerCase())
            label.innerHTML = `
                <h6>${title.date < 10 ? '0' + title.date : title.date}</h6>
                <p id="${constants.currentMonth}-${title.date}">${title.day}</p>
            `;
        }
        constants.container.appendChild(label);
    }

    daysOfTheWeek.forEach(createLabel, "col"); // Create a header label for every day fo the week
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
            day.day.toLowerCase() === constants.currentDay ? input.classList.add("current-day") : null;
            time === currentTimeApproximation ? input.classList.add("current-time") : null;
            input.ariaLabel = `${day.day.toLowerCase()}-${timeCleaned}`;
            input.onclick = openModal;
            constants.container.appendChild(input);
        })
    })
}

constants.nextWeek.addEventListener('click', () => {
    let currentWeek = constants.currentWeek.innerText;
    constants.lastWeek.disabled ? constants.lastWeek.disabled = false : null;

    for (let i = 0; i < constants.weeks.length - 1; i++) {
        constants.nextWeek.disabled = false;

        if (constants.weeks[i].week === currentWeek) {
            // If we are back to the current OR future week, enable the inputs
            if (constants.weeks[i+1].week === constants.week) {
                document.querySelectorAll("span").forEach(input => {
                    input.classList.remove('disabled');
                    input.classList.add('hover');
                    input.onclick = openModal;
                });
            }
            else if (new Date(constants.weeks[i+1].week) > new Date(constants.week)) {
                for (let input of document.querySelectorAll(".current-day, .current-time")) {
                    input.style.backgroundColor = 'whitesmoke';
                }
            }

            currentWeek = constants.weeks[i+1].week
            unloadOldStorage()
            constants.currentWeek.innerText = currentWeek;
            if (!weeklyData[currentWeek]) weeklyData[currentWeek] = [];
            updateColumnHeaders(currentWeek);
            loadStorage();
            
            // Disable buttons
            if (constants.weeks[constants.weeks.length - 1].week === currentWeek) constants.nextWeek.disabled = true;
            return
        }
    }
});

constants.lastWeek.addEventListener('click', () => {
    let currentWeek = constants.currentWeek.innerText;
    constants.nextWeek.disabled ? constants.nextWeek.disabled = false : null;

    for (let i = 1; i < constants.weeks.length; i++) {
        if (constants.weeks[i].week === currentWeek) {
            // If we are on a week in the past, disable the inputs
            if (new Date(constants.weeks[i-1].week) < new Date(constants.week)) {
                document.querySelectorAll("span").forEach(input => {
                    input.classList.remove('hover');
                    input.classList.add('disabled');
                    input.onclick = '';
                });
            }
            else if (constants.weeks[i-1].week === constants.week) {
                for (let input of document.querySelectorAll(".current-day, .current-time")) {
                    input.style.backgroundColor = '#c7c7c7';

                    if (input.classList.contains("current-day") && input.classList.contains("current-time")) {
                        input.style.backgroundColor = '#ACACAC';
                    }
                }
            }

            currentWeek = constants.weeks[i-1].week
            unloadOldStorage();
            constants.currentWeek.innerHTML = currentWeek;
            if (!weeklyData[currentWeek]) weeklyData[currentWeek] = [];
            updateColumnHeaders(currentWeek);
            loadStorage();
            
            // Disable buttons
            if (constants.weeks[0].week === currentWeek) {
                constants.lastWeek.disabled = true;
            }
            else if (constants.lastWeek.disabled) {
                constants.lastWeek.disabled = false;
            }
            return
        }
    }
});
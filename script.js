const container = document.getElementById("calendar");
const form = document.getElementById("activity-form");
const calendarHeader = document.getElementById("calendar-header");
const activityHeader = document.getElementById("activity-header");
let elementsEnabled = true;
let inputSelected = "";

const activitySaveButton = document.getElementById("activity-submit");
const activityCloseButton = document.getElementById("activity-close");
const activityName = document.getElementById("activity-name");
const activityDuration = document.getElementById("activity-duration");
const activityLocation = document.getElementById("activity-location");
const activityDescription = document.getElementById("activity-description");

// Upon loading the window, create the calendar
window.onload = () => {
    
    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        rowCol === "row" ? label.classList.add("rowHeader") : label.classList.add("colHeader", "sticky"); 
        label.textContent = title;
        container.appendChild(label);
    }

    // Creating columns to be days of the week, and rows to be 30-minute time slots
    const daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots = generateHoursInterval(60*7, 60 * 24, 30);

    // Create a header label for every day fo the week
    daysOfTheWeek.forEach(createLabel, "col");

    // Create a label for every timeSlot and  create an input for dayOfTheWeek
    timeSlots.forEach(time => {
        
        createLabel(time, "row")
        daysOfTheWeek.forEach(day => {
            const input = document.createElement("span");
            // input.type = "text";
            input.id = `${day}-${time}`;
            time.slice(3,5) === "30" ? input.className = "hour-mark" : input.className = "half-hour-mark";
            input.classList.add(day, "timeslot", "hover")
            input.ariaLabel = `${day}-${time}`;
            input.onclick = update;
            container.appendChild(input);
        })
    })

}


// Onchange to input, this function is called.
const update = event => {
    inputSelected = event.target;
    openModal();
};

const openModal = () => {
    // Bring up the form 
    form.style.zIndex = "1";
    form.classList.remove("hidden");
    activityHeader.classList.remove("hidden");
    // "Pause" the calendar
    container.classList.add("stop-scrolling");
    container.style.opacity = "10%";
    calendarHeader.style.opacity = "10%";
    disableElements()
};

const closeModal = () => {
    //Clean the values
    activityName.value = "";
    activityDuration.value = "30-minutes"
    activityLocation.value = "";
    activityDescription.value = "";

    // Else, do the reverse action
    form.style.zIndex = "0";
    form.classList.add("hidden");
    activityHeader.classList.add("hidden");

    container.classList.remove("stop-scrolling");
    container.style.opacity = "100%";
    calendarHeader.style.opacity = "100%";
    disableElements()
}

activitySaveButton.addEventListener("click", () => {
    
    if (activityName.value === ""){
        // alert("Please add a name")
        return
    }

    // If the hour period is selected we need to identify the next input to style
    if (activityDuration.value === "60-minutes") {
        const secondInput = document.getElementById(getNextInput(inputSelected.id));
        console.log(secondInput)
    }
    else {
        // inputSelected.id.innerHTML = `<p><${activityName}</p>`;
        // inputSelected
    }


    closeModal();
});

activityCloseButton.addEventListener("click", closeModal);

const getNextInput = (str) => {
    let day = str.match(/^.*?-/i);
    let time = str.match(/\d{2}:\d{2}/)[0];
    let hour = Number(time.slice(0,2));
    let minute = time.slice(3,5);

    // If it a 30 minute mark, hour will have to increment
    if (minute === "30"){
        hour += 1;
        minute = "00";

        // Keeping this in american time
        if (hour > 12){
            hour = hour % 12;
        }
        if (hour > 9){
            return `${day}${hour}:${minute} PM`;
        }
        return `${day}0${hour}:${minute} PM`;
    }
    else {
        minute = "30";
        if (hour > 9){
            return `${day}${hour}:${minute} ${str.slice(-2)}`;
        }
        return `${day}0${hour}:${minute} ${str.slice(-2)}`;
    }
}

const disableElements = () => {
    const elements = [...document.getElementsByClassName("timeslot")];

    if (elementsEnabled) {
        elements.forEach(el => el.classList.remove("hover"))
        elementsEnabled = false;
    }
    else {
        elements.forEach(el => el.classList.add("hover"));
        elementsEnabled =true;
    }
    return
}

/* Function to create an array of times with 30 minute intervals, 
code from "https://gist.github.com/indexzero/6261ad9292c78cf3c5aa69265e2422bf". Modified for personal need.
*/
const generateHoursInterval = (startHourInMinute, endHourInMinute, interval ) => {
    const times = [];
    for (let i = 0; startHourInMinute < 24 * 60; i++) {
        if (startHourInMinute > endHourInMinute) break;

        var hh = Math.floor(startHourInMinute / 60); // getting hours of day in 0-24 format
        var mm = startHourInMinute % 60; // getting minutes of the hour in 0-55 format

        // convert back to american time
        if (hh > 12){
            hh -= 12;
            times[i] = ('0' + (hh % 24)).slice(-2) + ':' + ('0' + mm).slice(-2) + ' PM';
        }
        else {
            times[i] = ('0' + (hh % 24)).slice(-2) + ':' + ('0' + mm).slice(-2) + ' AM';
        }
        
        startHourInMinute = startHourInMinute + interval;
    }
    return times;
};


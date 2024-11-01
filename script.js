const container = document.getElementById("calendar");
const form = document.getElementById("activity-form");
const calendarHeader = document.getElementById("calendar-header");
const activityHeader = document.getElementById("activity-header");
let buttonsEnabled = true;
let formEnabled = true;

const activityName = document.getElementById("activity-name");
const activityDuration = document.getElementById("activity-duration");
const activityLocation = document.getElementById("activity-location");
const activityDescription = document.getElementById("activity-description");
const activitySaveButton = document.getElementById("activity-submit");
const activityCloseButton = document.getElementById("activity-close");

// Upon loading the window, create the calendar
window.onload = () => {
    
    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        rowCol === "row" ? label.className = "rowHeader" : label.classList.add("colHeader", "sticky"); 
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
            const input = document.createElement("button");
            input.type = "text";
            input.id = `${day}-${time}`;
            time.slice(3,5) === "30" ? input.className = "hour-mark" : input.className = "half-hour-mark";
            input.classList.add(day)
            input.ariaLabel = `${day}-${time}`;
            input.onclick = update;
            container.appendChild(input);
        })
    })

}

// const addEvent = (event) => {
//     console.log(event.target)
// }

// Onchange to input, this function is called.
const update = event => {
    const element = event.target;
    triggerForm();

    if (formEnabled){

        var promise = new Promise(resolve => {
            
        })
    }

    activitySaveButton.addEventListener("click", () => {
        element.innerText = activityName.value;
        triggerForm();
    });


    activityCloseButton.addEventListener("click", () => {

        triggerForm();
    });


    return
};






const triggerForm = () => {
    // If the form is hidden, show it
    if (form.classList.contains("hidden")){
        activityName.value = "";
        activityLocation.value = "";
        activityDescription.value = "";

        // Bring up the form 
        form.style.zIndex = "1";
        form.classList.remove("hidden");
        activityHeader.classList.remove("hidden");
        // "Pause" the calendar
        container.classList.add("stop-scrolling");
        container.style.opacity = "10%";
        calendarHeader.style.opacity = "10%";
        formEnabled = true;
        disableButtons()
        // return
    }
    else {
        // Else, do the reverse action
        form.style.zIndex = "0";
        form.classList.add("hidden");
        activityHeader.classList.add("hidden");

        container.classList.remove("stop-scrolling");
        container.style.opacity = "100%";
        calendarHeader.style.opacity = "100%";

        formEnabled = false;
        disableButtons()
    }

    // activitySaveButton.addEventListener("click", () => {
    //     triggerForm();
    // });


    // activityCloseButton.addEventListener("click", () => {

    //     triggerForm();
    // });
    return

}

const disableButtons = () => {
    const buttons = document.querySelectorAll("button");

    if (buttonsEnabled) {
        buttons.forEach(button => button.disabled=true)
        buttonsEnabled = false;
    }
    else {
        buttons.forEach(button => button.disabled=false);
        buttonsEnabled =true;
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


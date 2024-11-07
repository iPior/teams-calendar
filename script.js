const container = document.getElementById("calendar");
const form = document.getElementById("activity-form");
const formDiv = document.getElementById("activity-form-div");
const calendarHeader = document.getElementById("calendar-header");
const lastWeek = document.getElementById("last-week");
const nextWeek = document.getElementById("next-week");
// const activityHeader = document.getElementById("header");/

let elementsEnabled = true;
let inputSelected = "";
const activeTimeSlots = [];
const activities = [];

// HTML objecst for modal
const activitySaveButton = document.getElementById("activity-submit");
const activityCancelButton = document.getElementById("activity-cancel");
const activityEditButton = document.getElementById("activity-edit");
const activityDeleteButton = document.getElementById("activity-delete");
const activityCloseButton = document.getElementById("activity-close");
const activityName = document.getElementById("activity-name");
const activityDuration = document.getElementById("activity-duration");
const activityLocation = document.getElementById("activity-location");
const activityDescription = document.getElementById("activity-description");

// Colors for modals
const colors = ["grey", "red", "orange", "yellow", "green", "blue", "purple", "pink"];
const greyButton = document.getElementById("grey");
const redButton = document.getElementById("red");
const orangeButton = document.getElementById("orange");
const yellowButton = document.getElementById("yellow");
const greenButton = document.getElementById("green");
const blueButton = document.getElementById("blue");
const purpleButton = document.getElementById("purple");
const pinkButton = document.getElementById("pink");
const colorButtons = [greyButton, redButton, orangeButton, yellowButton, greenButton, blueButton, purpleButton, pinkButton];

const taskData = JSON.parse(localStorage.getItem("data")) || [];

// Upon loading the window, create the calendar
window.onload = () => {
    createWeek();
    loadStorage();
}

const createWeek = () => {

    const date = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const day = date.getDay();
    const newDate = new Date(date.getDate() - day + (day == 0 ? -6 : 1));
    let startOfTheWeek = newDate.getDay();

    calendarHeader.innerText = "Week of " + month;
    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        if (rowCol === "row"){
            label.classList.add("rowHeader")
            label.innerHTML = `<p>${title}</p>`;
        }
        else {
            label.classList.add("colHeader", "sticky")
            label.innerHTML = `
            <h6>${title.date < 10 ? '0' + title.date : title.date}</h6>
            <p>${title.day}</p>
            `;
        }
        container.appendChild(label);
    }

    // Creating columns to be days of the week, and rows to be 30-minute time slots
    const timeSlots = generateHoursInterval(60*7, 60 * 24, 30);
    const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysOfTheWeekTwo = []
    for (let i = 0; i<7; i++){
        daysOfTheWeekTwo.push({date: Number(startOfTheWeek) + i, day: daysOfTheWeek[i]})
    }

    // Create a header label for every day fo the week
    daysOfTheWeekTwo.forEach(createLabel, "col");

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

// Takes the acitivites from the local storage and loads them onto the calendar
const loadStorage = () => {
    taskData.forEach(activity => {
        const input = document.getElementById(activity.id);
        input.classList.add("active");
        input.classList.remove("hover");
        input.onclick= editActivity;
        activeTimeSlots.push(input)
        if (activity.duration === "60-minutes"){
            input.innerHTML = `
            <div class="activity hour-long ${activity.color}">
                <h4>${activity.name}</h4>
                <p>${activity.description}</p>
            </div>`;
        }
        else {
            input.innerHTML = `
            <div class="activity ${activity.color}">
                <h4>${activity.name}</h4>
                <p>${activity.description}</p>
            </div>`;
        }

    })
}

// Onchange to input, this function is called.
const update = event => {
    inputSelected = event.target;
    openModal();
};

// Bring up the form 
const openModal = () => {

    // Show form
    formDiv.classList.remove("hidden")
    formDiv.style.zIndex = "1";

    // Hide calendar
    form.style.zIndex = "1";
    form.classList.remove("hidden");

    // "Pause" the calendar
    container.classList.add("stop-scrolling");
    container.style.opacity = "5%";
    calendarHeader.style.opacity = "5%";
    nextWeek.style.opacity ="5%";
    nextWeek.disabled = true;
    lastWeek.style.opacity ="5%";
    lastWeek.disabled = true;
    disableElements()
};

const cancelModal = () => {

    // Hide form
    formDiv.classList.add("hidden")
    formDiv.style.zIndex = "0";

    // Show calendar
    form.style.zIndex = "0";
    form.classList.add("hidden");

    // Enable calendar buttons
    container.classList.remove("stop-scrolling");
    container.style.opacity = "100%";
    calendarHeader.style.opacity = "100%";
    nextWeek.style.opacity ="100%";
    nextWeek.disabled = false;
    lastWeek.style.opacity ="100%";
    lastWeek.disabled = false;
    disableElements();
    
}

const closeModel = () => {
    //Disable the color buttons
    colorButtons.forEach(btn => btn.disabled = false);

    // Disable the inputs
    activityName.disabled = false;
    activityDuration.disabled = false;
    activityLocation.disabled = false;
    activityDescription.disabled = false;

    // Select the right buttons
    activitySaveButton.classList.remove("hidden");
    activityCancelButton.classList.remove("hidden");
    activityEditButton.classList.add("hidden");
    activityDeleteButton.classList.add("hidden");
    activityCloseButton.classList.add("hidden");
    cancelModal();
}

const openEditModal = (task) => {

    // Fill in the inputs
    activityName.value = task.name;
    activityDuration.value = task.duration;
    activityLocation.value = task.location;
    activityDescription.value = task.description;

    // Set the color of the modal
    const color = task.color.match(/^\w+(?=-)/)[0];
    setColorFromButton(document.getElementById(color));

    // Disable the inputs
    activityName.disabled = true;
    activityDuration.disabled = true;
    activityLocation.disabled = true;
    activityDescription.disabled = true;

    //Disable the color buttons
    colorButtons.forEach(btn => btn.disabled = true);

    // Select the right buttons
    activitySaveButton.classList.add("hidden");
    activityCancelButton.classList.add("hidden");
    activityEditButton.classList.remove("hidden");
    activityDeleteButton.classList.remove("hidden");
    activityCloseButton.classList.remove("hidden");
    
    // Open the modal
    openModal();
}

const editActivity = (event) => {
    
    taskData.forEach(task => {
        // console.log("Target Event: ", event.target)
        if (task.id === event.target.id){
            openEditModal(task)
        }
    })
}

activitySaveButton.addEventListener("click", () => {

    const firstInput = document.getElementById(inputSelected.id);
    const color = checkActiveColor();

    const activity = {
        id: firstInput.id,
        name: activityName.value,
        duration: activityDuration.value,
        location: activityLocation.value,
        description: activityDescription.value,
        color: color,
        style: firstInput.classList,
    }

    if (activityName.value.trim() === ""){
        return
    }

    // If the hour period is selected we need to identify the next input to style
    if (activityDuration.value === "60-minutes") {
        const secondInput = document.getElementById(getNextInput(inputSelected.id));
        firstInput.classList.add("active");
        secondInput.classList.add("active");
        firstInput.classList.remove("hover");
        secondInput.classList.remove("hover");
        activeTimeSlots.push(firstInput,secondInput)
        firstInput.onclick= editActivity;
        firstInput.innerHTML = `
            <div class="activity hour-long ${color}" >
                <h4>${activityName.value}</h4>
                <p>${activityDescription.value}</p>
            </div>`;
    }
    else {
        firstInput.classList.add("active")
        firstInput.classList.remove("hover")
        activeTimeSlots.push(firstInput)
        firstInput.onclick = editActivity;
        firstInput.innerHTML = `
            <div class="activity ${color}">
                <h4>${activityName.value}</h4>
                <p>${activityDescription.value}</p>
            </div>`;
    }
    resetInputs()
    cancelModal();
    taskData.push(activity)
    localStorage.setItem("data", JSON.stringify(taskData))
});

activityCloseButton.addEventListener("click", closeModel);
activityCancelButton.addEventListener("click", cancelModal);
greyButton.addEventListener("click", () => setColorFromButton(greyButton));
redButton.addEventListener("click", () => setColorFromButton(redButton));
orangeButton.addEventListener("click", () => setColorFromButton(orangeButton));
yellowButton.addEventListener("click", () => setColorFromButton(yellowButton));
greenButton.addEventListener("click", () => setColorFromButton(greenButton));
blueButton.addEventListener("click", () => setColorFromButton(blueButton));
purpleButton.addEventListener("click", () => setColorFromButton(purpleButton));
pinkButton.addEventListener("click", () => setColorFromButton(pinkButton));


// Reset the values of inputs back to default
const resetInputs = () => {
    setColorFromButton(greyButton); //Reset the color

    //Clean the values
    activityName.value = "";
    activityDuration.value = "30-minutes"
    activityLocation.value = "";
    activityDescription.value = "";
}

// Function to generalie changing the color of the buttons
const setColorFromButton = (button) => {
    colors.forEach(color => {
        if (form.classList.contains(color) && color !== button.id) {
            form.classList.remove(color);
        }
    });
    colorButtons.forEach(btn => {
        if (btn.classList.contains("selected") && btn.id !== button.id) {
            btn.classList.remove("selected");
        }
    });

    button.classList.add("selected");
    form.classList.add(button.id)
}

// Function to check what color the note needs to be
const checkActiveColor = () => {
    let color = "";
    colorButtons.forEach(btn => {
        if (btn.classList.contains("selected")) {
            color = `${btn.id}-activity`;
        }
    });
    return color;
}

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
        elements.forEach(el => {
           if (!activeTimeSlots.includes(el))
            el.classList.add("hover")
        });
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


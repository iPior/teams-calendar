import * as constants from './modules/constants.js';
import {getNextInput, generateHoursInterval, resetInputs, setColorFromButton, 
    disableEnableInputs, checkActiveColor, updateColumnHeaders, disableElements} from './modules/utilities.js';

// Active variables
let inputSelected = null;
let currentTask = null;
let currentWeek = null;
let inputs = null;
let currentDayInputs = null;
let activeTimeSlots = [];

// Local storage data array
const weeklyData = localStorage.getItem("weeklyData") ? JSON.parse(localStorage.getItem("weeklyData")) : {};
let taskData = [];

// Upon loading the window, create the calendar
window.onload = () => {
    createWeek();
    loadStorage();
}

// Create the calendar module
const createWeek = () => {
    
    // Create the weeks array and the the current week
    currentWeek = constants.weeks.find(weekStart => weekStart.week === constants.week)?.week || currentWeek;

    taskData = weeklyData[currentWeek] || [];
    constants.calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;

    // Creating columns to be days of the week, and rows to be 30-minute time slots
    const date = new Date();
    const timeSlots = generateHoursInterval(60*7, 60 * 24, 30);
    const daysOfTheWeek = [];
    let startOfTheWeek = new Date(constants.newDate).getDate();
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
            title.day.toLowerCase() === constants.currentDay ? label.classList.add("colHeader", "sticky", title.day.toLowerCase(), "current-day") : label.classList.add("colHeader", "sticky", title.day.toLowerCase())
            label.innerHTML = `
            <h6>${title.date < 10 ? '0' + title.date : title.date}</h6>
            <p id="${constants.currentMonth}-${title.date}">${title.day}</p>
            `;
        }
        constants.container.appendChild(label);
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
            day.day.toLowerCase() === constants.currentDay ? input.classList.add("current-day") : null;
            time === currentTimeApproximation ? input.classList.add("current-time") : null;
            input.ariaLabel = `${day.day.toLowerCase()}-${timeCleaned}`;
            input.onclick = update;
            constants.container.appendChild(input);
        })
    })

    // Create element with all the spans that were created
    inputs = document.querySelectorAll("span");
    currentDayInputs = document.querySelectorAll(".current-day, .current-time");
}

// Onchange to input, this function is called.
const update = event => {
    inputSelected = event.target;
    openModal();
};

// Takes the acitivites from the local storage and loads them onto the calendar
const loadStorage = () => {
    if (!taskData){
        return
    }

    taskData.forEach(activity => {
        const input = document.getElementById(activity.id);
        input.classList.add("active");
        input.classList.remove("hover");
        input.onclick = '';
        activeTimeSlots.push(input)
        if (activity.duration === "60-minutes"){
            const secondInput = document.getElementById(getNextInput(activity.id));
            secondInput.classList.add("active");
            secondInput.classList.remove("hover");
            secondInput.onclick = "";
            secondInput.style.zIndex = "-1";
            activeTimeSlots.push(secondInput);
            input.innerHTML = `
            <div class="activity hour-long ${activity.color}" >
                <div class="click">
                    <h4>${activity.name}</h4>
                    <p class="italic">${activity.location}</p>
                    <p>${activity.description}</p>
                </div>
            </div>`;
        }
        else {
            input.innerHTML = `
            <div class="activity ${activity.color}">
                <div class="click">
                    <h4>${activity.name}</h4>
                    <p class="italic">${activity.location}</p>
                </div>
            </div>`;
        }
    })

    document.querySelectorAll(".click").forEach(el => el.addEventListener("click", event => openActivity(event)));
}

const unloadOldStorage = () => {

    taskData.forEach(activity => {
        
        const input = document.getElementById(activity.id);
        input.classList.remove("active");
        input.classList.add("hover");
        input.style.zIndex = "auto";
        input.onclick = update;

        // Remove timeslot
        activeTimeSlots = activeTimeSlots.filter(timeSlot => timeSlot.id !== input.id);

        if (activity.duration === "60-minutes"){
            const secondInput = document.getElementById(getNextInput(activity.id));
            activeTimeSlots = activeTimeSlots.filter(timeSlot => timeSlot.id !== secondInput.id);
            secondInput.classList.remove("active");
            secondInput.classList.add("hover");
            secondInput.onclick = update;
            secondInput.style.zIndex = "auto";
            activeTimeSlots.push(secondInput); // remove this

            input.innerHTML = ""
        }
        else {
            input.innerHTML = ""
        }

    })
}

constants.nextWeek.addEventListener('click', () => {
    if (constants.lastWeek.disabled){
        constants.lastWeek.disabled = false;
    }

    for (let i = 0; i < constants.weeks.length - 1; i++) {
        constants.nextWeek.disabled = false;

        if (constants.weeks[i].week === currentWeek) {
            // If we are back to the current OR future week, enable the inputs
            if (constants.weeks[i+1].week === constants.week) {
                inputs.forEach(input => {
                    input.classList.remove('disabled');
                    input.classList.add('hover');
                    input.onclick = update;
                });
            }
            else if (new Date(constants.weeks[i+1].week) > new Date(constants.week)) {
                for (let input of currentDayInputs) {
                    input.style.backgroundColor = 'whitesmoke';
                }
            }

            currentWeek = constants.weeks[i+1].week
            constants.calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;
            unloadOldStorage()
            if (!weeklyData[currentWeek]) {
                weeklyData[currentWeek] = []
            }
            taskData = weeklyData[currentWeek];
            updateColumnHeaders(currentWeek);
            loadStorage();
            
            // Disable buttons
            if (constants.weeks[constants.weeks.length - 1].week === currentWeek){
                constants.nextWeek.disabled = true;
            }
            return
        }
    }
    
});

constants.lastWeek.addEventListener('click', () => {
    
    // If we are on the first week, disable the last week button
    if (constants.nextWeek.disabled){
        constants.nextWeek.disabled = false;
    }

    for (let i = 1; i < constants.weeks.length; i++) {
        if (constants.weeks[i].week === currentWeek) {
            // If we are on a week in the past, disable the inputs
            if (new Date(constants.weeks[i-1].week) < new Date(constants.week)) {
                inputs.forEach(input => {
                    input.classList.remove('hover');
                    input.classList.add('disabled');
                    input.onclick = '';
                });
            }
            else if (constants.weeks[i-1].week === constants.week) {
                for (let input of currentDayInputs) {
                    input.style.backgroundColor = '#c7c7c7';

                    if (input.classList.contains("current-day") && input.classList.contains("current-time")) {
                        input.style.backgroundColor = '#ACACAC';
                    }
                }
            }

            currentWeek = constants.weeks[i-1].week
            constants.calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;
            unloadOldStorage();
            if (!weeklyData[currentWeek]) {
                weeklyData[currentWeek] = []
            }
            taskData = weeklyData[currentWeek];
            updateColumnHeaders(currentWeek);
            loadStorage();

            // Disable buttons
            if (constants.weeks[0].week === currentWeek) {
                lastWeek.disabled = true;
            }
            else if (constants.lastWeek.disabled) {
                constants.lastWeek.disabled = false;
            }
            return
        }
    }
});

const openActivity = (event) => {
    let id = null;
    // Check if we are modifying the right element
    (event.target.matches("h4") || event.target.matches("p")) ?
    id = event.target.parentElement.parentElement.parentElement.id :
    id = event.target.parentElement.parentElement.id;
    
    // Disable the inputs
    constants.activityName.disabled = true;
    constants.activityDuration.disabled = true;
    constants.activityLocation.disabled = true;
    constants.activityDescription.disabled = true;

    //Disable the color buttons
    constants.colorButtons.forEach(btn => btn.disabled = true);

    // Select the right buttons
    constants.activitySaveButton.classList.add("hidden");
    constants.activityCancelButton.classList.add("hidden");
    constants.activityEditButton.classList.remove("hidden");
    constants.activityDeleteButton.classList.remove("hidden");
    constants.activityCloseButton.classList.remove("hidden");
    
    // Open the modal
    openModal();

    taskData.forEach(task => {
        if (task.id === id){
            // Fill in inputs
            inputSelected = task.id;

            // Set the current task
            currentTask=task

            // Fill in the inputs
            constants.activityName.value = task.name;
            constants.activityDuration.value = task.duration;
            task.location === "" ? constants.activityLocation.value = " " : constants.activityLocation.value = task.location;
            task.description === "" ? constants.activityDescription.value = " " : constants.activityDescription.value = task.description;

            // Set the color of the modal
            const color = task.color.match(/^\w+(?=-)/)[0];
            setColorFromButton(document.getElementById(color));
        }
    })
};

// Bring up the form 
 const openModal = () => {

    // Show form
    constants.formDiv.classList.remove("hidden")
    constants.formDiv.style.zIndex = "1";

    // Hide calendar
    constants.form.style.zIndex = "1";
    constants.form.classList.remove("hidden");

    // "Pause" the calendar
    constants.container.classList.add("stop-scrolling");
    constants.container.style.opacity = "5%";
    constants.calendarHeader.style.opacity = "5%";
    constants.nextWeek.style.opacity ="5%";
    constants.nextWeek.disabled = true;
    constants.lastWeek.style.opacity ="5%";
    constants.lastWeek.disabled = true;

    disableElements(true);
    return
};

// cancel
const cancelModal = () => {

    // Hide form
    constants.formDiv.classList.add("hidden")
    constants.formDiv.style.zIndex = "0";

    // Show calendar
    constants.form.style.zIndex = "0";
    constants.form.classList.add("hidden");

    // Enable calendar buttons
    constants.container.classList.remove("stop-scrolling");
    constants.container.style.opacity = "100%";
    constants.calendarHeader.style.opacity = "100%";
    constants.nextWeek.style.opacity ="100%";
    constants.nextWeek.disabled = false;
    constants.lastWeek.style.opacity ="100%";
    constants.lastWeek.disabled = false;

    disableElements(false);
    resetInputs();
    
}

const closeModal = () => {
    //Disable the color buttons
    constants.colorButtons.forEach(btn => btn.disabled = false);

    // Disable the inputs
    constants.activityName.disabled = false;
    constants.activityDuration.disabled = false;
    constants.activityLocation.disabled = false;
    constants.activityDescription.disabled = false;

    // Select the right buttons
    constants.activitySaveButton.classList.remove("hidden");
    constants.activityCancelButton.classList.remove("hidden");
    constants.activityEditButton.classList.add("hidden");
    constants.activityDeleteButton.classList.add("hidden");
    constants.activityCloseButton.classList.add("hidden");
    cancelModal();
}

constants.activityCancelButton.addEventListener("click", cancelModal);
constants.activityCloseButton.addEventListener("click", closeModal);

constants.activitySaveModalButton.addEventListener("click", () => {
    const color = checkActiveColor();
    
    // Making changes in the local storage
    weeklyData[currentWeek].forEach(tsk => {
        if (tsk.id === currentTask.id) {
            const secondInput = document.getElementById(getNextInput(currentTask.id));

            // If we are modifying from 30 min to 60min or vice versa
            if (tsk.duration === "30-minutes" && constants.activityDuration.value === "60-minutes") {
                
                if (activeTimeSlots.includes(secondInput)){
                    alert("Time slots overlap")
                    return
                }
                secondInput.classList.add("active");
                secondInput.classList.remove("hover");
                secondInput.onclick = "";
                secondInput.style.zIndex = "-1";
                activeTimeSlots.push(secondInput);
            }
            else if (tsk.duration === "60-minutes" && constants.activityDuration.value === "30-minutes") {
                secondInput.classList.remove("active");
                secondInput.classList.add("hover");
                secondInput.onclick = update;
                secondInput.style.zIndex = "auto";
                // Remove from active time slots and remove from local storage
                activeTimeSlots = activeTimeSlots.filter(timeSlot => timeSlot.id !== secondInput.id);
                taskData = taskData.filter(task => task.id !== secondInput.id);
            }
            tsk.name = constants.activityName.value;
            tsk.duration = constants.activityDuration.value;
            tsk.location = constants.activityLocation.value;
            tsk.description = constants.activityDescription.value;
            tsk.color = color;
            return
        }
    });
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData));
    disableEnableInputs(true);
    unloadOldStorage();
    loadStorage();
    closeModal();
});

constants.activityCancelSaveModalButton.addEventListener("click", () => {
     // Enable/Disable the inputs
    constants.activityName.disabled = true;
    constants.activityDuration.disabled = true;
    constants.activityLocation.disabled = true;
    constants.activityDescription.disabled = true;

    //Enable the color buttons
    constants.colorButtons.forEach(btn => btn.disabled = true);

    constants.activitySaveModalButton.classList.add("hidden");
    constants.activityCancelSaveModalButton.classList.add("hidden");
    constants.activityEditButton.classList.remove("hidden");
    constants.activityDeleteButton.classList.remove("hidden");
    constants.activityCloseButton.classList.remove("hidden");
    cancelModal();
});

constants.activitySaveButton.addEventListener("click", (e) => {

    const firstInput = document.getElementById(inputSelected.id);
    firstInput.onclick = '';

    const color = checkActiveColor();

    const activity = {
        id: firstInput.id,
        name: constants.activityName.value,
        duration: constants.activityDuration.value,
        location: constants.activityLocation.value,
        description: constants.activityDescription.value,
        color: color,
        style: firstInput.classList,
    }

    if (constants.activityName.value.trim() === ""){
        constants.activityName.setCustomValidity("Please enter a title!");
        return
    }

    // If the hour period is selected we need to identify the next input to style
    if (constants.activityDuration.value === "60-minutes") {
        const secondInput = document.getElementById(getNextInput(inputSelected.id));
        if (activeTimeSlots.includes(secondInput)){
            alert("Time slots overlap")
            return
        }
        firstInput.classList.add("active");
        secondInput.classList.add("active");
        firstInput.classList.remove("hover");
        secondInput.classList.remove("hover");
        firstInput.onclick = "";
        secondInput.onclick = "";
        secondInput.style.zIndex = "-1";
        activeTimeSlots.push(firstInput,secondInput)
        firstInput.innerHTML = 
            `<div class="activity hour-long ${color}">
                <div class="click">
                <h4>${constants.activityName.value}</h4>
                <p class="italic">${constants.activityLocation.value}</p>
                <p>${constants.activityDescription.value}</p>
                </div>
            </div>`;
    }
    else {
        firstInput.classList.add("active")
        firstInput.classList.remove("hover")
        firstInput.onclick = ""
        activeTimeSlots.push(firstInput)
        firstInput.innerHTML = `
            <div class="activity ${color}" >
                <div class="click">
                <h4>${constants.activityName.value}</h4>
                <p class="italic">${constants.activityLocation.value}</p>
                </div>
            </div>`;
    }
    firstInput.children[0].children[0].addEventListener("click", event => openActivity(event));
    resetInputs()
    cancelModal();
    taskData.push(activity)
    weeklyData[currentWeek] = taskData;
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData))
    
});

constants.activityDeleteButton.addEventListener("click", () => {
    const input = document.getElementById(inputSelected);

    //If this is an hour long activity reset second input
    if (input.children[0].classList.contains("hour-long")){
        const secondInput = document.getElementById(getNextInput(input.id));
        secondInput.classList.remove("active");
        secondInput.classList.add("hover");
        secondInput.onclick = update;
        secondInput.style.zIndex = "0";
        // Remove from active time slots and remove from local storage
        activeTimeSlots = activeTimeSlots.filter(timeSlot => timeSlot.id !== secondInput.id);
        taskData = taskData.filter(task => task.id !== secondInput.id);
    }

    // Reset input
    input.classList.remove("active");
    input.classList.add("hover");
    input.onclick = update;

    // Remove from active time slots and remove from local storage
    activeTimeSlots = activeTimeSlots.filter(timeSlot => timeSlot.id !== input.id);
    taskData = taskData.filter(task => task.id !== input.id);

    // Update the local storage
    weeklyData[currentWeek] = taskData;

    if (weeklyData[currentWeek].length === 0){
        delete(weeklyData[currentWeek]);
    
    }
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData))
    
    // Delete div
    input.children[0].remove();
    
    // Close modal
    closeModal();
});

constants.activityEditButton.addEventListener("click", () => {
   disableEnableInputs(false)
     // Show form
    constants.formDiv.classList.remove("hidden")
    constants.formDiv.style.zIndex = "1";

    // Hide calendar
    constants.form.style.zIndex = "1";
    constants.form.classList.remove("hidden");

    // "Pause" the calendar
    constants.container.classList.add("stop-scrolling");
    constants.container.style.opacity = "5%";
    constants.calendarHeader.style.opacity = "5%";
    constants.nextWeek.style.opacity ="5%";
    constants.nextWeek.disabled = true;
    constants.lastWeek.style.opacity ="5%";
    constants.lastWeek.disabled = true; 
});

// Event listeners for the modal color buttons
constants.greyButton.addEventListener("click", () => setColorFromButton(constants.greyButton));
constants.redButton.addEventListener("click", () => setColorFromButton(constants.redButton));
constants.orangeButton.addEventListener("click", () => setColorFromButton(constants.orangeButton));
constants.yellowButton.addEventListener("click", () => setColorFromButton(constants.yellowButton));
constants.greenButton.addEventListener("click", () => setColorFromButton(constants.greenButton));
constants.blueButton.addEventListener("click", () => setColorFromButton(constants.blueButton));
constants.purpleButton.addEventListener("click", () => setColorFromButton(constants.purpleButton));
constants.pinkButton.addEventListener("click", () => setColorFromButton(constants.pinkButton));
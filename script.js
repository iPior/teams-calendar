const container = document.getElementById("calendar");
const form = document.getElementById("activity-form");
const formDiv = document.getElementById("activity-form-container");
const calendarHeader = document.getElementById("calendar-header");
const colHeaders = document.getElementsByClassName("colHeader");
const lastWeek = document.getElementById("last-week");
const nextWeek = document.getElementById("next-week");

// Active variables
let elementsEnabled = true;
let inputSelected = null;
let currentTask = null;
let currentWeek = null;
let inputs = null;
let currentDayInputs = null;
const activeTimeSlots = [];
const activities = [];

// HTML objecst for modal
const activitySaveButton = document.getElementById("activity-submit");
const activityCancelButton = document.getElementById("activity-cancel");
const activitySaveModalButton = document.getElementById("activity-save");
const activityCancelSaveModalButton = document.getElementById("activity-cancel-save");
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

// Date and time formatting options
const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
const currentDay = new Intl.DateTimeFormat("en-US", {weekday: 'long'}).format(new Date()).toLowerCase();
const currentMonth = new Intl.DateTimeFormat("en-US", {month: 'long'}).format(new Date()).toLowerCase();

// Setting the dates
const date = new Date();
const newDate = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1))); // Getting start of the week
const week = new Intl.DateTimeFormat("en-US", options).format(newDate);

// Local storage data array
const weeklyData = localStorage.getItem("weeklyData") ? JSON.parse(localStorage.getItem("weeklyData")) : {};
let taskData = [];

// Function to create an array of all the weeks in the current year
const getWeeksInYear = (year) => {
  const weeks = [];
  let startDate = new Date(year, 0, 1); // January 1st of the given year

  // Adjust start date to the first Monday of the year
  while (startDate.getDay() !== 1) {
    startDate.setDate(startDate.getDate() + 1);
  }

  while (startDate.getFullYear() === year) {
    const endDate = new Date(startDate); // Copy start date
    endDate.setDate(endDate.getDate() + 6); // End of the week

    weeks.push({
      week: new Intl.DateTimeFormat("en-US", options).format(startDate),
    });

    // Move start date to the next week
    startDate.setDate(startDate.getDate() + 7);
  }
  return weeks;
}
const weeks = getWeeksInYear(Number(new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(new Date())));

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
                <div class="click" onclick="openActivity(event)">
                    <h4>${activity.name}</h4>
                    <p class="italic">${activity.location}</p>
                    <p>${activity.description}</p>
                </div>
            </div>`;
        }
        else {
            input.innerHTML = `
            <div class="activity ${activity.color}">
                <div class="click" onclick="openActivity(event)">
                    <h4>${activity.name}</h4>
                    <p class="italic">${activity.location}</p>
                </div>
            </div>`;
        }
    })
}

const unloadOldStorage = () => {
    taskData.forEach(activity => {
        
        const input = document.getElementById(activity.id);
        input.classList.remove("active");
        input.classList.add("hover");
        input.style.zIndex = "auto";
        input.onclick = update;
        // Remove timeslot
        activeTimeSlots.forEach(timeSlot => { 
            if (timeSlot.id === input.id){
                activeTimeSlots.splice(activeTimeSlots.indexOf(timeSlot), 1);
            }
        });
        if (activity.duration === "60-minutes"){
            const secondInput = document.getElementById(getNextInput(activity.id));
            activeTimeSlots.forEach(timeSlot => { 
                if (timeSlot.id === secondInput.id){
                    activeTimeSlots.splice(activeTimeSlots.indexOf(timeSlot), 1);
                }
            });
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

nextWeek.addEventListener('click', () => {
    if (lastWeek.disabled){
        lastWeek.disabled = false;
    }

    for (let i = 0; i < weeks.length - 1; i++) {
        nextWeek.disabled = false;

        if (weeks[i].week === currentWeek) {
            // If we are back to the current OR future week, enable the inputs
            if (weeks[i+1].week === week) {
                inputs.forEach(input => {
                    input.classList.remove('disabled');
                    input.classList.add('hover');
                    input.onclick = update;
                });
            }
            else if (new Date(weeks[i+1].week) > new Date(week)) {
                for (let input of currentDayInputs) {
                    input.style.backgroundColor = 'whitesmoke';
                }
            }

            currentWeek = weeks[i+1].week
            calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;
            unloadOldStorage()
            if (!weeklyData[currentWeek]) {
                weeklyData[currentWeek] = []
            }
            taskData = weeklyData[currentWeek];
            updateColumnHeaders(currentWeek);
            loadStorage();
            
            // Disable buttons
            if (weeks[weeks.length - 1].week === currentWeek){
                nextWeek.disabled = true;
            }
            return
        }
    }
    
});

lastWeek.addEventListener('click', () => {
    
    // If we are on the first week, disable the last week button
    if (nextWeek.disabled){
        nextWeek.disabled = false;
    }

    for (let i = 1; i < weeks.length; i++) {
        if (weeks[i].week === currentWeek) {
            // If we are on a week in the past, disable the inputs
            if (new Date(weeks[i-1].week) < new Date(week)) {
                inputs.forEach(input => {
                    input.classList.remove('hover');
                    input.classList.add('disabled');
                    input.onclick = '';
                });
            }
            else if (weeks[i-1].week === week) {
                for (let input of currentDayInputs) {
                    input.style.backgroundColor = '#c7c7c7';

                    if (input.classList.contains("current-day") && input.classList.contains("current-time")) {
                        input.style.backgroundColor = '#ACACAC';
                    }
                }
            }

            currentWeek = weeks[i-1].week
            calendarHeader.innerHTML = "<i class='fa-solid fa-calendar'></i>Week of " + currentWeek;
            unloadOldStorage();
            if (!weeklyData[currentWeek]) {
                weeklyData[currentWeek] = []
            }
            taskData = weeklyData[currentWeek];
            updateColumnHeaders(currentWeek);
            loadStorage();

            // Disable buttons
            if (weeks[0].week === currentWeek) {
                lastWeek.disabled = true;
            }
            else if (lastWeek.disabled) {
                lastWeek.disabled = false;
            }
            return
        }
    }
});

// Onchange to input, this function is called.
const update = event => {
    inputSelected = event.target;
    openModal();
};

const updateColumnHeaders = (week) => {
    const date = new Date(week);
    let counter = 1;

    for (let item of colHeaders) {
        if (counter <= 7){ 
            item.children[0].innerHTML = `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
            item.children[1].id = `${currentMonth}-${date.getDate()}`;
            date.setDate(date.getDate()+1);
            counter++;
        }
    }
}

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

    disableElements();
    return
};

// cancel
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
    resetInputs();
    
}

const closeModal = () => {
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

const editModal = () => {
    disableEnableInputs(false)
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
}

activitySaveModalButton.addEventListener("click", () => {
    const color = checkActiveColor();
    
    // Making changes in the local storage
    weeklyData[currentWeek].forEach(tsk => {
        if (tsk.id === currentTask.id) {
            const secondInput = document.getElementById(getNextInput(currentTask.id));

            // If we are modifying from 30 min to 60min or vice versa
            if (tsk.duration === "30-minutes" && activityDuration.value === "60-minutes") {
                
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
            else if (tsk.duration === "60-minutes" && activityDuration.value === "30-minutes") {
                secondInput.classList.remove("active");
                secondInput.classList.add("hover");
                secondInput.onclick = update;
                secondInput.style.zIndex = "auto";
                // Remove from active time slots and remove from local storage
                activeTimeSlots.forEach(timeSlot => { 
                    if (timeSlot.id === secondInput.id){
                        activeTimeSlots.splice(activeTimeSlots.indexOf(timeSlot), 1);
                    }
                });
                weeklyData[currentWeek].forEach(task => {
                    if (task.id === secondInput.id){
                        taskData.splice(taskData.indexOf(task), 1);
                    }
                })
            }
            tsk.name = activityName.value;
            tsk.duration = activityDuration.value;
            tsk.location = activityLocation.value;
            tsk.description = activityDescription.value;
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

activityCancelSaveModalButton.addEventListener("click", () => {
     // Enable/Disable the inputs
    activityName.disabled = true;
    activityDuration.disabled = true;
    activityLocation.disabled = true;
    activityDescription.disabled = true;

    //Enable the color buttons
    colorButtons.forEach(btn => btn.disabled = true);

    activitySaveModalButton.classList.add("hidden");
    activityCancelSaveModalButton.classList.add("hidden");
    activityEditButton.classList.remove("hidden");
    activityDeleteButton.classList.remove("hidden");
    activityCloseButton.classList.remove("hidden");
    cancelModal();
});

const openActivity = (event) => {
    let id = null;
    // Check if we are modifying the right element
    (event.target.matches("h4") || event.target.matches("p")) ?
    id = event.target.parentElement.parentElement.parentElement.id :
    id = event.target.parentElement.parentElement.id;
    
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

    taskData.forEach(task => {
        if (task.id === id){
            // Fill in inputs
            inputSelected = task.id;

            // Set the current task
            currentTask=task

            // Fill in the inputs
            activityName.value = task.name;
            activityDuration.value = task.duration;
            task.location === "" ? activityLocation.value = " " : activityLocation.value = task.location;
            task.description === "" ? activityDescription.value = " " : activityDescription.value = task.description;

            // Set the color of the modal
            const color = task.color.match(/^\w+(?=-)/)[0];
            setColorFromButton(document.getElementById(color));
        }
    })
}

const deleteActivity = () => {
    // const input = inputSelected;
    const input = document.getElementById(inputSelected);

    //If this is an hour long activity reset second input
    if (input.children[0].classList.contains("hour-long")){
        const secondInput = document.getElementById(getNextInput(input.id));
        secondInput.classList.remove("active");
        secondInput.classList.add("hover");
        secondInput.onclick = update;
        secondInput.style.zIndex = "0";
        // Remove from active time slots and remove from local storage
        activeTimeSlots.forEach(timeSlot => { 
            if (timeSlot.id === secondInput.id){
                activeTimeSlots.splice(activeTimeSlots.indexOf(timeSlot), 1);

            }
        });
        taskData.forEach(task => {
            if (task.id === secondInput.id){
                taskData.splice(taskData.indexOf(task), 1);
            }
        })
    }

    // Reset input
    input.classList.remove("active");
    input.classList.add("hover");
    input.onclick = update;

    // Remove from active time slots and remove from local storage
    activeTimeSlots.forEach(timeSlot => { 
        if (timeSlot.id === input.id){
            activeTimeSlots.splice(activeTimeSlots.indexOf(timeSlot), 1);
        }
    });
    taskData.forEach(task => {
        if (task.id === input.id){
            taskData.splice(taskData.indexOf(task), 1);
        }
    })
    // Update the local storage
    weeklyData[currentWeek] = taskData;
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData))

    // Delete div
    input.children[0].remove();

    // Close modal
    closeModal();
}

activitySaveButton.addEventListener("click", (e) => {

    const firstInput = document.getElementById(inputSelected.id);
    firstInput.onclick = '';

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
        activityName.setCustomValidity("Please enter a title!");
        return
    }

    // If the hour period is selected we need to identify the next input to style
    if (activityDuration.value === "60-minutes") {
        const secondInput = document.getElementById(getNextInput(inputSelected.id));
        console.log(secondInput)
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
                <div class="click" onclick="openActivity(event)">
                <h4>${activityName.value}</h4>
                <p class="italic">${activityLocation.value}</p>
                <p>${activityDescription.value}</p>
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
                <div class="click" onclick="openActivity(event)">
                <h4>${activityName.value}</h4>
                <p class="italic">${activityLocation.value}</p>
                </div>
            </div>`;
    }
    resetInputs()
    cancelModal();
    taskData.push(activity)
    weeklyData[currentWeek] = taskData;
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData))
    
});

activityCloseButton.addEventListener("click", closeModal);
activityCancelButton.addEventListener("click", cancelModal);
activityDeleteButton.addEventListener("click", deleteActivity);
activityEditButton.addEventListener("click", editModal);
greyButton.addEventListener("click", () => setColorFromButton(greyButton));
redButton.addEventListener("click", () => setColorFromButton(redButton));
orangeButton.addEventListener("click", () => setColorFromButton(orangeButton));
yellowButton.addEventListener("click", () => setColorFromButton(yellowButton));
greenButton.addEventListener("click", () => setColorFromButton(greenButton));
blueButton.addEventListener("click", () => setColorFromButton(blueButton));
purpleButton.addEventListener("click", () => setColorFromButton(purpleButton));
pinkButton.addEventListener("click", () => setColorFromButton(pinkButton));

const disableEnableInputs = (disabledBool) => {

        // Enable/Disable the inputs
        activityName.disabled = disabledBool;
        activityDuration.disabled = disabledBool;
        activityLocation.disabled = disabledBool;
        activityDescription.disabled = disabledBool;
    
        //Enable the color buttons
        colorButtons.forEach(btn => btn.disabled = disabledBool);

        if (disabledBool){
            activitySaveModalButton.classList.add("hidden");
            activityCancelSaveModalButton.classList.add("hidden");
            activityEditButton.classList.remove("hidden");
            activityDeleteButton.classList.remove("hidden");
            activityCloseButton.classList.remove("hidden");
        }
        else {
            activitySaveModalButton.classList.remove("hidden");
            activityCancelSaveModalButton.classList.remove("hidden");
            activityEditButton.classList.add("hidden");
            activityDeleteButton.classList.add("hidden");
            activityCloseButton.classList.add("hidden");
        }
};

// Reset the values of inputs back to default
const resetInputs = () => {
    setColorFromButton(greyButton); //Reset the color
    
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
    let time = str.match(/\d{2}-\d{2}/)[0];
    let hour = Number(time.slice(0,2));
    let minute = time.slice(3,5);
    let amPM = str.slice(-2);

    // If it a 30 minute mark, hour will have to increment
    if (minute === "30"){
        hour += 1;
        minute = "00";

        // Keeping this in american time
        if (amPM === "PM"){
            hour = hour % 12;
            if (hour > 9){
                return `${day}${hour}-${minute}-PM`;
            }
            return `${day}0${hour}-${minute}-PM`;
        }
        else {
            if (hour > 9){
                return `${day}${hour}-${minute}-AM`;
            }
            return `${day}0${hour}-${minute}-AM`;
        }
    }
    else {
        minute = "30";

        // Keeping this in american time
        if (amPM === "PM"){
            hour = hour % 12;
            if (hour > 9){
                return `${day}${hour}-${minute}-PM`;
            }
            return `${day}0${hour}-${minute}-PM`;
        }
        else {

            if (hour > 9){
                return `${day}${hour}-${minute}-${str.slice(-2)}`;
            }
            return `${day}0${hour}-${minute}-${str.slice(-2)}`;
        }
    }
}

const disableElements = () => {

    if (elementsEnabled) {
        inputs.forEach(el => {
            if (!activeTimeSlots.includes(el)){
                el.classList.remove("hover");
                el.onclick = '';
            }
        })
        elementsEnabled = false;
    }
    else {
        inputs.forEach(el => {
            if (!activeTimeSlots.includes(el)){
                el.classList.add("hover")
                el.onclick = update;
            }   
        });
        elementsEnabled = true;
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
        else if (hh === 12){
            times[i] = ('0' + (hh % 24)).slice(-2) + ':' + ('0' + mm).slice(-2) + ' PM';
        }
        else {
            times[i] = ('0' + (hh % 24)).slice(-2) + ':' + ('0' + mm).slice(-2) + ' AM';
        }
        
        startHourInMinute = startHourInMinute + interval;
    }
    return times;
};


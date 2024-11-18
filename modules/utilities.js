import * as constants from './constants.js';

// function to get the input below the one being selected
export const getNextInput = (str) => {
    
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

/* Function to create an array of times with 30 minute intervals, 
code from "https://gist.github.com/indexzero/6261ad9292c78cf3c5aa69265e2422bf". Modified for personal need.
*/
export const generateHoursInterval = (startHourInMinute, endHourInMinute, interval) => {
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

// Reset the values of inputs back to default
export const resetInputs = () => {
    setColorFromButton(constants.greyButton); //Reset the color
    
    constants.activityName.value = "";
    constants.activityDuration.value = "30-minutes"
    constants.activityLocation.value = "";
    constants.activityDescription.value = "";
};

// Function to generalie changing the color of the buttons
export const setColorFromButton = (button) => {
    constants.colors.forEach(color => {
        if (constants.form.classList.contains(color) && color !== button.id) {
            constants.form.classList.remove(color);
        }
    });
    constants.colorButtons.forEach(btn => {
        if (btn.classList.contains("selected") && btn.id !== button.id) {
            btn.classList.remove("selected");
        }
    });

    button.classList.add("selected");
    constants.form.classList.add(button.id)
};

export const disableEnableInputs = (disabledBool) => {

        // Enable/Disable the inputs
        constants.activityName.disabled = disabledBool;
        constants.activityDuration.disabled = disabledBool;
        constants.activityLocation.disabled = disabledBool;
        constants.activityDescription.disabled = disabledBool;
    
        //Enable the color buttons
        constants.colorButtons.forEach(btn => btn.disabled = disabledBool);

        if (disabledBool){
            constants.activitySaveModalButton.classList.add("hidden");
            constants.activityCancelSaveModalButton.classList.add("hidden");
            constants.activityEditButton.classList.remove("hidden");
            constants.activityDeleteButton.classList.remove("hidden");
            constants.activityCloseButton.classList.remove("hidden");
        }
        else {
            constants.activitySaveModalButton.classList.remove("hidden");
            constants.activityCancelSaveModalButton.classList.remove("hidden");
            constants.activityEditButton.classList.add("hidden");
            constants.activityDeleteButton.classList.add("hidden");
            constants.activityCloseButton.classList.add("hidden");
        }
};

// Function to check what color the note needs to be
export const checkActiveColor = () => {
    let color = "";
    constants.colorButtons.forEach(btn => {
        if (btn.classList.contains("selected")) {
            color = `${btn.id}-activity`;
        }
    });
    return color;
};

// Function to update the column headers to reflect the current week being displayed
export const updateColumnHeaders = (week) => {
    const date = new Date(week);
    let counter = 1;

    for (let item of constants.colHeaders) {
        if (counter <= 7){ 
            item.children[0].innerHTML = `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
            item.children[1].id = `${constants.currentMonth}-${date.getDate()}`;
            date.setDate(date.getDate()+1);
            counter++;
        }
    }
};

export const disableElements = (bool) => {
    const inputs = document.querySelectorAll("span")
    bool ? 
        inputs.forEach(el => el.classList.remove("hover")) :
        inputs.forEach(el => el.classList.add("hover"));
    return
}
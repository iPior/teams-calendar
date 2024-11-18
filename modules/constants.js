// HTML objects for calendar
export const container = document.getElementById("calendar");
export const form = document.getElementById("activity-form");
export const formDiv = document.getElementById("activity-form-container");
export const calendarHeader = document.getElementById("calendar-header");
export const colHeaders = document.getElementsByClassName("colHeader");
export const lastWeek = document.getElementById("last-week");
export const nextWeek = document.getElementById("next-week");

// HTML objects for modal
export const activitySaveButton = document.getElementById("activity-submit");
export const activityCancelButton = document.getElementById("activity-cancel");
export const activitySaveModalButton = document.getElementById("activity-save");
export const activityCancelSaveModalButton = document.getElementById("activity-cancel-save");
export const activityEditButton = document.getElementById("activity-edit");
export const activityDeleteButton = document.getElementById("activity-delete");
export const activityCloseButton = document.getElementById("activity-close");
export const activityName = document.getElementById("activity-name");
export const activityDuration = document.getElementById("activity-duration");
export const activityLocation = document.getElementById("activity-location");
export const activityDescription = document.getElementById("activity-description");

// Colors for modals
export const greyButton = document.getElementById("grey");
export const redButton = document.getElementById("red");
export const orangeButton = document.getElementById("orange");
export const yellowButton = document.getElementById("yellow");
export const greenButton = document.getElementById("green");
export const blueButton = document.getElementById("blue");
export const purpleButton = document.getElementById("purple");
export const pinkButton = document.getElementById("pink");
export const colorButtons = [greyButton, redButton, orangeButton, yellowButton, greenButton, blueButton, purpleButton, pinkButton];
export const colors = ["grey", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

// Date and time formatting options
export const currentDay = new Intl.DateTimeFormat("en-US", {weekday: 'long'}).format(new Date()).toLowerCase();
export const currentMonth = new Intl.DateTimeFormat("en-US", {month: 'long'}).format(new Date()).toLowerCase();

// Setting the dates
const date = new Date();
export const newDate = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1))); // Getting start of the week
export const week = new Intl.DateTimeFormat("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}).format(newDate);

/* 
Function to create an array of all the weeks in the current year.
This function is being initialized in this file because ulitilies.js calls on these constants so they need to be initilzed first.
*/ 
export const getWeeksInYear = (year) => {
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
      week: new Intl.DateTimeFormat("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}).format(startDate),
    });

    // Move start date to the next week
    startDate.setDate(startDate.getDate() + 7);
  }
  return weeks;
}

export const weeks = getWeeksInYear(Number(new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(date)));

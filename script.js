
// Upon loading the window, create the calendar
window.onload = () => {
    const container = document.getElementById("calendar");

    // Function to create a row
    const createLabel = (title, rowCol) => {
        const label = document.createElement("div");
        rowCol === "row" ? label.className = "rowHeader" : label.className = "colHeader"; 
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
            const input = document.createElement("input");
            input.type = "text";
            input.id = `${day}-${time}`;
            time.slice(3,5) === "30" ? input.className = "hour-mark" : input.className = "half-hour-mark";
            input.classList.add(day)
            input.ariaLabel = `${day}-${time}`;
            input.onchange = update;
            container.appendChild(input);
        })
    })

    const rows = document.getElementsByClassName("Monday");
    console.log(rows)
}

// Onchange to input, this function is called.
const update = event => {
    const element = event.target;
    const value = element.value.replace(/\s/g, "");
    if (!value.includes(element.id)) {
      console.log(value)
    }
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


const fs = require('fs');
const path = require('path');


module.exports = {
    addReminder: function(userId, channelId, dateTimeString, reminderText) {
        // Parse the date and time from the string
        let [month, day, year, time] = dateTimeString.split('/');
        let [hours, minutes] = time.split(':');

        // JavaScript's Date uses 0-indexed months, so subtract 1 from the month
        console.log(month, day, year, hours, minutes);
        let date = new Date(year, month - 1, day, hours, minutes);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date');
            return;
        }

        // Convert the date to a timestamp
        let timestamp = date.getTime();
        console.log("TIMESTAMP:" + timestamp)

        // Load the current reminders
        let reminders = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/reminders.json'), 'utf8'));

        // Add the new reminder
        reminders.push({
            userId,
            channelId,
            time: timestamp,
            reminderText
        });

        // Save the updated reminders
        fs.writeFileSync(path.resolve(__dirname, '../data/reminders.json'), JSON.stringify(reminders));
    },
    getReminders: function() {
        // Load the reminders
        let reminders = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/reminders.json'), 'utf8'));

        return reminders;
    }
};

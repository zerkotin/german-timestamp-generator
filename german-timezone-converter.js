var germanTimezoneConverterUtil = {	
	
	/**
     * returns the timestamp of the last sunday of a given year and month in UTC
     * @param year 4 digit year
     * @param month 1 to 31
     * @param daysInMonth how many days are in this month? 28, 29, 30, 31 ?
     * @returns {number} the timestamp of the last sunday of the month
     * these calculations must be done in UTC,otherwise we will get an infinite loop  if we use createDateInGermanTimezone
     */
    getLastSundayOfMonthTimestamp: function getLastSundayOfMonthTimestamp(year, month, daysInMonth) {
        var date =  new Date(Date.UTC(year, month -1, daysInMonth, 0, 0));
        for(var i=daysInMonth; i>0 && date.getDay() !== 0; i--) { //getDay == 0 is sunday
            date.setDate(i);
        }
        return Date.UTC(year, month -1, date.getDate(), 0, 0); //returning the right day
    },

    /**
     * checks if daylight saving time is active for a specific date in german time
     * @param year 4 digit year
     * @param month from 1 to 12
     * @param day from 1 to 31
     * @param hours hours since midnight (0 to 23)
     * @param minutes 0 to 60
     * @returns {Boolean}true when is daylight saving time otherwise false
     * daylight saving time is between the last sunday of march and the last sunday of october.
     * these calculations must be done in UTC,otherwise we will get an infinite loop  if we use createDateInGermanTimezone
     */
    isDaylightSavingTimeInGermany: function isDaylightSavingTimeInGermany(year, month, day, hours, minutes) {

        if(arguments.length == 1) { //in case i send only a date
            var date = arguments[0];
            year = date.getFullYear();
            month = date.getMonth()+1;
            day = date.getDate();
            hours = date.getHours();
            minutes = date.getMinutes();
        }

        var marchUTCTimestamp = this.getLastSundayOfMonthTimestamp(year, 3, 31);
        var octoberUTCTimestamp = this.getLastSundayOfMonthTimestamp(year, 10, 31);

        var dateToCheck = Date.UTC(year, month -1, day, hours, minutes);

        return (dateToCheck > marchUTCTimestamp && dateToCheck < octoberUTCTimestamp);//daylight saving time is between march and october
    },

    /**
     * checking if a year is Leap year and has 366 days
     * @param year
     * @returns {Boolean}true when leap year, false when not
     */
    isLeapYear: function isLeapYear(year){
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    },

    /**
     * createDateInGermanTimezone
     * @param year, full 4 digit year
     * @param month, motnh from 1 to 12
     * @param day, day in month, 1 to 31
     * @param hours, hours since midnight, midnight is 0
     * @param minutes, 0 to 59
     */
    createDateInGermanTimezone: function createDateInGermanTimezone(year, month, day, hours, minutes) {

        var timestamp = 0; //we will create an epoch timestamp from this
        var i; //for the loops to come

        //adding years
        var daysInYear = 0; //for the years loop
        for(i=1970; i<year; i++) {
            daysInYear = this.isLeapYear(i) ? 366: 365; //leap year has 1 more day in february
            timestamp += 86400000*daysInYear; //1000*60*60*24
        }

        //adding all the previous months
        var daysInMonths = [31,28,31,30,31,30,31,31,30,31,30,31];
        if(this.isLeapYear(year)) { //in case of leap year, february has 29 days
            daysInMonths[1] = 29;
        }

        for(i=0; i< month-1; i++) {
            timestamp += (daysInMonths[i])*86400000; //1000*60*60*24
        }

        //now add current month days
        timestamp += (day -1)*86400000; //1000*60*60*24

        //now we can add hours and minutes
        //so here is hours
        timestamp += hours*3600000; //1000*60*60

        //and minutes
        timestamp += minutes*60000; //1000*60

        //because this is epoch timestamp, we need to remove timezone offset before creating a new date
        //for germany, its 1 or 2 depending on daylight saving time
        var timezoneOffset = this.isDaylightSavingTimeInGermany(year, month, day, hours, minutes) ? 2 : 1;
        timestamp -= 3600000*timezoneOffset; //1000*60*60

        //now we make a new date out of it
        return new Date(timestamp);
    },

    /**
     * convertLocalDateToGermanTimezone
     * @param date, the date in local timezone
     * returns a new date with the same date and time only in the german timezone
     * example:
     * local time: Dec 10, 14:13 local timezone
     * will return: Dec 10, 14:13 german timezone
     * does not includes seconds and milliseconds
     */
    convertLocalDateToGermanTimezone: function convertLocalDateToGermanTimezone(date) {
        //month +1 since getMonth is 0 based and our api needs 1 based
        return this.createDateInGermanTimezone(date.getFullYear(), date.getMonth() +1, date.getDate(), date.getHours(), date.getMinutes());
    },

    /**
     * convertGermanDateToLocalTimezone
     * @param germanDate, the german date object created with createDateInGermanTimezone
     * returns a new date in the local timezone
     * example:
     * german time: Dec 10, 14:13 german timezone
     * will return: Dec 10, 14:13 local timezone
     */
    convertGermanDateToLocalTimezone: function convertGermanDateToLocalTimezone(germanDate) {
        var now = new Date();
        var timezoneOffsetInMinutes = this.isDaylightSavingTimeInGermany(germanDate) ? 120 : 60;
        return new Date(germanDate.getTime() + (now.getTimezoneOffset() + timezoneOffsetInMinutes)*60000) //60*1000
    }
};
# German Timezone Converter

This util is made to simulate requested date and time in German timezone.  
For example:  
I would like to have April 14 2016, 15:00 in German timezone as a Date object and save it to the database.  
Whats the problem you ask?  
Because we forgot to use UTC at the beginning of the project and now we have timezone issues when we save data to the database.  
In addition, we are not allowed to change the database, so this should be an ALL UI solution.

## How to use:
Include the JS file in your sources, and use as follows...  

Lets say you already have the wanted time already from a date picker, but its in your local timezone.


    var local = new Date(2016, 3, 14, 15, 0); //Thu Apr 14 2016 15:00:00 GMT+0600 
    var german = germanTimezoneConverterUtil.convertLocalDateToGermanTimezone(local); //Thu Apr 14 2016 15:00:00 GMT+0200
    
    //you can save it to db now
    somePersistenceLayer.save(german);


you can do the same thing backwards when you get it from the server in order to show it show it in local time:


    var german = somePersistenceLayer.fetch();
    var local = germanTimezoneConverterUtil.convertGermanDateToLocalTimezone(german);
    
    //now you can use local in some renderer or update your ui
    someUIComponent.setDate(local);


you can also create a german timezone date with specific year, month, day, hours and minutes with the following API:

    var german = germanTimezoneConverterUtil.createDateInGermanTimezone(2016, 4, 14, 15, 0);

var fs = require('fs');
var moment = require('moment');
var parseString = require('xml2js').parseString;

exports.getEvents = getEvents;

//Get the events from the given file.  If the file does not exist, or is unparseable, return an error. 
function getEvents (filename, eventsCallback) {
  var events = [];
  fs.readFile(filename, function (err, data) {
    if(!err) {
      parseString(data, function (err, result) {
      if(!err) {
        var unparsedEvents = result.feed.entry.filter(filterOutRehearsals);
        var numberOfEvents = unparsedEvents.length;
        for (var i = 0; i < numberOfEvents; i++) {
          var event = {};
          var summary = unparsedEvents[i].summary[0]._;
          event.title = unparsedEvents[i].title[0]._;
          event.date = getDateFromSummary(summary);
          var eventMoment = moment(event.date);
          event.dateString = eventMoment.format("dddd MMMM Do, YYYY - h:mm a")
          event.location = getLocationFromSummary(summary);
          events[i] = event;
          events.sort(sortBasedOnDate);
        } 
        eventsCallback(events, err);
      } else {
        eventsCallback(events, err);
      }
      });
    } else {
      eventsCallback(events, err);
    }        
  });
}

function filterOutRehearsals(event, index, array) {
  //If the event is a rehearsal, do not include it. 
  if (event.title[0]._.match('[Rr]ehearsal')) {
    return false;
  } else {
    return true;
  }
}

function sortBasedOnDate(event1, event2) {
  //Helper function for sorting events.  Return difference of dates. 
  return event1.date - event2.date;
}

function getDateFromSummary(summary) {
  //Get the Date of the event using regex.
  var re = /When: (.*?[\d{2}:\d{2}]) to/; 
  var match;
 
  if ((match = re.exec(summary)) !== null) {
    if (match.index === re.lastIndex) {
        re.lastIndex++;
    }
    var dateString = match[1];
    return new Date(dateString);
  }
  return '';
}

function getLocationFromSummary(summary) {
  //get the Location of the event using regex.
  var re = /Where: (.*?)\n/;
  var match;

  if ((match = re.exec(summary)) !== null) {
    if (match.index === re.lastIndex) {
        re.lastIndex++;
    }
    var locationString = match[1];
    return locationString;
  }
  return '';
}


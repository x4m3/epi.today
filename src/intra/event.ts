import request from "request";

type EventType = {
    semester: number;
    module: string;
    name: string;
    registered: boolean;
};

/**
 * Construct events request URL of a date
 * @param autologin user's intra autologin link
 * @param year year of events
 * @param month month of events
 * @param day day of events
 * @returns URL ready to be used
 */
function ConstructRequestURL(autologin: string, year: string, month: string, day: string) : string {
    let RequestURL: string;

    RequestURL  = "https://intra.epitech.eu/" + autologin;
    RequestURL += "/planning/load?format=json";
    RequestURL += "&start=" + year + "-" + month + "-" + day;
    RequestURL += "&end=" + year + "-" + month + "-" + day;

    return RequestURL;
};

/**
 * Downloads list of events of a particular date
 * @param autologin user's intra autologin link
 * @param year year of events
 * @param month  month of events
 * @param day day of events
 * @returns Array of matching events
 */
function getEvents(autologin: string, year: string, month: string, day: string) : Array<EventType> {
    let EventList: Array<EventType> = [];

    let QueryURL = ConstructRequestURL(autologin, year, month, day);

    request(QueryURL, { json: true }, (err, res, body) => {
        if (err) { return console.log(err) }

        if (res.statusCode == 200) {
            JSON.parse(JSON.stringify(body)).forEach((event: any) => {
                console.log(`${event.semester} ${event.titlemodule} ${event.acti_title} ${event.event_registered}`);
                EventList.push({
                    semester: event.semester,
                    module: event.titlemodule,
                    name: event.acti_title,
                    registered: (event.event_registered == "registered") ? true : false
                });
            });
            EventList.forEach(event => {
                console.log(`done ${event.semester} ${event.module} ${event.name} ${event.registered}`);
            });
        }
    });

    console.log("done");
    return EventList;
};

export { EventType, getEvents };
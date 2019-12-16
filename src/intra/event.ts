import * as request from "request-promise";

type EventType = {
    semester: number;
    module: string;
    name: string;
    registered: boolean;
    time: {
        start: string;
        end: string;
    };
    url: string;
    studentsRegistered: string;
};

enum ErrorCode {
    Network,
    HTTP403,
    HTTPGeneric,
    BadParsing
}

type ErrorType = {
    code: ErrorCode;
    message?: String;
};

type IntraRequestType = {
    EventList: Array<EventType>;
    Error?: ErrorType;
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
    // RequestURL  = "https://localhost/" + autologin;
    RequestURL += "/planning/load?format=json";
    RequestURL += "&start=" + year + "-" + month + "-" + day;
    RequestURL += "&end=" + year + "-" + month + "-" + day;

    return RequestURL;
};

/**
 * Function checking if a parsed JSON Object is empty or not
 * Warning: Dirty function that I didn't write, stole it here:
 * https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty
 * @param json_parsed parsed JSON
 * @returns whether if Object is empty or not
 */
function isJSONParsingEmpty(json_parsed: any) : boolean {
    for (var key in json_parsed) {
        if (json_parsed.hasOwnProperty(key)) {
            /* object is not empty if a key has its own property */
            return false;
        }
    }
    return true;
};

function parseJSON(json: any, IntraRequest: IntraRequestType) {
    json.forEach((event: any) => {
        console.log(`we are at ${event.semester} ${event.titlemodule} ${event.acti_title} ${event.event_registered} from ${event.start} to ${event.end} 'https://intra.epitech.eu/module/${event.scolaryear}/${event.codemodule}/${event.codeinstance}/${event.codeacti}/'`);
        IntraRequest.EventList.push({
            semester: event.semester,
            module: event.titlemodule,
            name: event.acti_title,
            registered: (event.event_registered == "registered") ? true : false,
            time: {
                start: event.start,
                end: event.end
            },
            url: `https://intra.epitech.eu/module/${event.scolaryear}/${event.codemodule}/${event.codeinstance}/${event.codeacti}/`,
            studentsRegistered: `https://intra.epitech.eu/module/${event.scolaryear}/${event.codemodule}/${event.codeinstance}/${event.codeacti}/${event.codeevent}/registered/`
        });
    });
    IntraRequest.EventList.forEach(event => {
        console.log(`done ${event.semester} ${event.module} ${event.name} ${event.registered} from ${event.time.start} to ${event.time.end} ${event.url}`);
    });
}

/**
 * Downloads list of events of a particular date
 * @param autologin user's intra autologin link
 * @param year year of events
 * @param month  month of events
 * @param day day of events
 * @returns Array of matching events (empty array if there are no events) or an error
 */
async function getEvents(autologin: string, year: string, month: string, day: string) : Promise<IntraRequestType> {
    /* declare an empty IntraRequestType with a empty EventList */
    let IntraRequest: IntraRequestType = <IntraRequestType>{};
    IntraRequest.EventList = [];

    const RequestURL = ConstructRequestURL(autologin, year, month, day);
    const RequestOptions: request.RequestPromiseOptions = {
        json: true,
        headers: {
            "User-Agent": "epi.today"
        }
    };

    let intraRequest = await request.get(RequestURL, RequestOptions, (err, res, body) => {
        if (err) {
            IntraRequest.Error = <ErrorType>{};
            IntraRequest.Error.code = ErrorCode.Network;
            IntraRequest.Error.message = err;
            console.log(`request() error ${err}`);
            return IntraRequest;
        }

        if (res.statusCode == 403) {
            IntraRequest.Error = <ErrorType>{};
            IntraRequest.Error.code = ErrorCode.HTTP403;
            console.error("intra 403");
            return IntraRequest;
        }

        if (res.statusCode != 200) {
            IntraRequest.Error = <ErrorType>{};
            IntraRequest.Error.code = ErrorCode.HTTPGeneric;
            IntraRequest.Error.message = `Intra replied HTTP ${res.statusCode}: ${res.statusMessage}`
            console.error(`http error code ${res.statusCode}: ${res.statusMessage}`);
            return IntraRequest;
        }

        if (res.statusCode == 200) {
            console.log("intra 200");

            /* TODO: maybe use something else than JSON.stringify and JSON.parse:
             * they are blocking functions and data can be lost
             * more info here: https://medium.com/@pmzubar/why-json-parse-json-stringify-is-a-bad-practice-to-clone-an-object-in-javascript-b28ac5e36521
             */
            const json_string = JSON.stringify(body);
            let json_parsed;

            try {
                json_parsed = JSON.parse(json_string);
                // json_parsed = JSON.parse("{\"abd:\"jane}"); // used to simulate a bad json string
            } catch (err) {
                IntraRequest.Error = <ErrorType>{};
                IntraRequest.Error.code = ErrorCode.BadParsing;
                IntraRequest.Error.message = err.message;
                console.error(err.message);
                return IntraRequest;
            }

            /* if there are no events */
            if (isJSONParsingEmpty(json_parsed) == true) {
                console.log("no events");
                return IntraRequest;
            }

            parseJSON(json_parsed, IntraRequest);
        }
    });

    console.log("done");
    return IntraRequest;
};

export { IntraRequestType, EventType, ErrorCode, getEvents };

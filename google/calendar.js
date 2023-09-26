import CalendarAPI from "node-google-calendar";
import dotenv from "dotenv";
import fs from "fs";
import getDirname from "../helpers/getDirname.js";
import path from "path";
dotenv.config();

const { private_key: key, client_email: serviceAcctId } = JSON.parse(
	fs.readFileSync(
		path.join(getDirname(import.meta.url), "./credentials.json")
	)
);

const { GOOGLE_CALENDAR_URL: calendarURL, GOOGLE_CALENDAR_ID: calendarId } =
	process.env;

export default new CalendarAPI({
	calendarURL,
	serviceAcctId,
	calendarId: { CHL: calendarId },
	key,
	timezone: "Europe/London",
});

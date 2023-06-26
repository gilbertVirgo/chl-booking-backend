import { Model } from "../Model.js";
import dotenv from "dotenv";
dotenv.config();

export default new Model({
	name: "Booking",
	spreadsheetId: process.env.BOOKING_SHEET_ID,
	spreadsheetTitle: "Main",
});

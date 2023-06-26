import { Model } from "../Model.js";
import dotenv from "dotenv";
dotenv.config();

export default new Model({
	name: "User",
	spreadsheetId: process.env.USER_SHEET_ID,
	spreadsheetTitle: "Main",
});

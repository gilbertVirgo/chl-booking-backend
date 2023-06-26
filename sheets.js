import dotenv from "dotenv";
import fs from "fs";
import getDirname from "./getDirname.js";
import { google } from "googleapis";
import path from "path";

dotenv.config();

const credentials = JSON.parse(
	fs.readFileSync(
		path.join(getDirname(import.meta.url), "./credentials.json")
	)
);

const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default google.sheets({ version: "v4", auth });

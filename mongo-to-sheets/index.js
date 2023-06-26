import dotenv from "dotenv";
import getDirname from "../getDirname.js";
import parseMongoData from "./parse-mongo-data.js";
import path from "path";
import sheets from "../sheets.js";

dotenv.config();

// Function to write the JSON data to the Google Sheet
async function writeToSheet() {
	try {
		// Read the existing data from the Google Sheet
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: "Main",
		});

		const existingData = response.data.values || [];

		// Add the new JSON data to the existing data
		const newData = [
			...existingData,
			...parseMongoData(
				path.join(getDirname(import.meta.url), "output.json")
			).map((r) => Object.values(r)),
		];

		// Write the updated data to the Google Sheet
		await sheets.spreadsheets.values.update({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: "Main",
			valueInputOption: "USER_ENTERED",
			resource: { values: newData },
		});

		console.log("Data written to the Google Sheet successfully!");
	} catch (error) {
		console.error("Error writing data to the Google Sheet:", error);
	}
}

// Invoke the function to write the JSON data to the Google Sheet
writeToSheet();

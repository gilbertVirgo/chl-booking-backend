import dotenv from "dotenv";
import sheets from "../sheets.js";
dotenv.config;

async function run() {
	const {
		data: { values },
	} = await sheets.spreadsheets.values.get({
		spreadsheetId: process.env.DS_SHEET_ID,
		range: "match(TRUE,arrayformula(isblank(Booking!A:Booking!A)),0)",
	});

	console.log({ values });
}

run();
// Failed test

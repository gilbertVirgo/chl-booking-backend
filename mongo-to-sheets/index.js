import dotenv from "dotenv";
import fs from "fs";
import getDirname from "../getDirname.js";
import path from "path";
import sheets from "../sheets.js";

// Some developments from today.
// Foreign fields are now linked, meaning if the field changes on its origin
// sheet, that change will automatically be reflected on all other sheets
// without any intervention from my code. This is huge!

dotenv.config();

const colFromIndex = (index) => String.fromCharCode("A".charCodeAt(0) + index);

const titleRowFrom = (ds) => Object.keys(ds[0]);

// Function to write the JSON data to the Google Sheet
async function run() {
	const json = JSON.parse(
		fs.readFileSync(path.join(getDirname(import.meta.url), "output.json"), {
			encoding: "utf-8",
		})
	);

	const parsed = json.map(
		({ event, status, archived, client, dateCreated }, i) => {
			return {
				index: i,
				date_of_tour: new Date(event.start.dateTime).toLocaleDateString(
					"en-GB"
				),
				date_created: new Date(dateCreated).toLocaleDateString("en-GB"),
				firstname: client.firstname,
				lastname: client.lastname,
				email: client.email,
				phone: client.tel ? `"${client.tel}"` : "",
				comments_or_questions: client.comments,
				group_size: client.groupSize,
				archived,
				status,
			};
		}
	);

	let bookingDS = parsed.map(
		({
			index,
			date_of_tour,
			date_created,
			email,
			group_size,
			comments_or_questions,
			archived,
			status,
		}) => {
			return {
				index,
				date_of_tour,
				date_created,
				customer_email: email,
				group_size,
				comments_or_questions,
				archived,
				status,
			};
		}
	);

	let customerDS = [];
	parsed.forEach(({ index, email, phone, firstname, lastname }) => {
		const cIndex = customerDS.findIndex((c) => c.email === email);

		if (cIndex > -1) {
			return; // Ignore dupes
		} else {
			customerDS.push({
				index: customerDS.length,
				email,
				firstname,
				lastname,
				phone,
			});
		}
	});

	bookingDS = bookingDS.map(
		({ index, date_of_tour, date_created, customer_email, ...b }) => {
			const row =
					customerDS.find(({ email }) => email === customer_email)
						.index + 2,
				customerTitleRow = titleRowFrom(customerDS),
				firstnameCol = colFromIndex(
					customerTitleRow.indexOf("firstname")
				),
				lastnameCol = colFromIndex(
					customerTitleRow.indexOf("lastname")
				);
			return {
				index,
				date_of_tour,
				date_created,
				customer: `=Customer!A${row}`,
				customer_name: `=CONCATENATE(Customer!${firstnameCol}${row}," ",Customer!${lastnameCol}${row})`,
				...b,
			};
		}
	);

	/*
		This '=TEXTJOIN(",",1,FILTER(Booking!A2:A,Booking!D2:D=A2))' line is 
		worth explaining...

		Rather than me programmatically doing the many-to-one index stuff in 
		JS, Google sheets does it for me. It searches through the booking sheet
		looking for bookings which have the relevant customer index. Then it
		returns the indexes of those bookings. The TEXTJOIN function simply
		concatenates it all into a comma-separated list. Groovy!
	 */

	let bookingTitleRow = titleRowFrom(bookingDS),
		bookingIndexCol = colFromIndex(bookingTitleRow.indexOf("index")),
		bookingCustomerCol = colFromIndex(bookingTitleRow.indexOf("customer"));

	customerDS = customerDS.map((v, i) => {
		const row = i + 2;

		return {
			...v,
			bookings: `=TEXTJOIN(",",TRUE,FILTER(Booking!${bookingIndexCol}2:${bookingIndexCol},Booking!${bookingCustomerCol}2:${bookingCustomerCol}=A${row}))`,
		};
	});

	try {
		// Write the updated data to the Google Sheet
		await sheets.spreadsheets.values.update({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: "Booking!A2:Z",
			valueInputOption: "USER_ENTERED",
			resource: {
				values: bookingDS.map((r) => Object.values(r)),
			},
		});

		// Write the updated data to the Google Sheet
		await sheets.spreadsheets.values.update({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: "Customer!A2:Z",
			valueInputOption: "USER_ENTERED",
			resource: {
				values: customerDS.map((r) => Object.values(r)),
			},
		});

		console.log("Data written to the Google Sheet successfully!");
	} catch (error) {
		console.error("Error writing data to the Google Sheet:", error);
	}
}

// Invoke the function to write the JSON data to the Google Sheet
run();

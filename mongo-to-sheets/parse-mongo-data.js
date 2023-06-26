import fs from "fs";

export default (jsonFilePath) => {
	const json = JSON.parse(
		fs.readFileSync(jsonFilePath, { encoding: "utf-8" })
	);

	return json.map(({ event, status, archived, client, dateCreated }, i) => {
		return {
			index: i,
			date_of_tour: new Date(event.start.dateTime).toLocaleDateString(
				"en-GB"
			),
			date_created: new Date(dateCreated).toLocaleDateString("en-GB"),
			customer_firstname: client.firstname,
			customer_lastname: client.lastname,
			customer_email: client.email,
			customer_phone: client.tel ? `"${client.tel}"` : "",
			customer_comments: client.comments,
			group_size: client.groupSize,
			comments: "",
			archived,
			status,
		};
	});
};

// date_of_tour	date_created	customer_firstname	customer_lastname	customer_email	customer_comments	group_size	comments

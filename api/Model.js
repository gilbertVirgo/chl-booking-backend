import ObjectLib from "object-lib";
import dotenv from "dotenv";
import sheets from "../sheets.js";
dotenv.config();

const filterByQuery = (docs, query) => {
	return docs.filter((doc) => ObjectLib.contains(doc, query));
};

export class Model {
	constructor(spreadsheetTitle) {
		this.spreadsheetTitle = spreadsheetTitle;
	}

	async init() {
		const {
			data: { values },
		} = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.spreadsheetTitle,
		});

		this.titleRow = values[0];

		console.log(
			`Successfully initialised model '${this.spreadsheetTitle}'`
		);

		return this;
	}

	objectToValues(object) {
		return this.titleRow.map((value) => {
			if (!object.hasOwnProperty(value)) return "";

			return object[value];
		});
	}

	valuesToObject(values) {
		const r = {};

		this.titleRow.forEach((value, index) => {
			r[value] = values[index];
		});

		return r;
	}

	getHorizontalLimits() {
		const xA = "A",
			xB = String.fromCharCode(xA.charCodeAt(0) + this.titleRow.length);

		return [xA, xB];
	}

	getRange(yA, yB) {
		const [xA, xB] = this.getHorizontalLimits();

		// Just get one row (probably the only use case)
		if (!yB) yB = yA;

		return `${this.spreadsheetTitle}!${xA}${+yA + 2}:${xB}${+yB + 2}`;
	}

	getRangeAll() {
		const [xA, xB] = this.getHorizontalLimits();

		// Ignore the top row (which contains the column titles)
		return `${this.spreadsheetTitle}!${xA}2:${xB}`;
	}

	async find(query = {}) {
		const range = query.hasOwnProperty("index")
			? this.getRange(query.index)
			: this.getRangeAll();

		const {
			data: { values },
		} = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range,
		});

		let docs = (values || []).map(this.valuesToObject.bind(this));

		return filterByQuery(docs, query);
	}

	async update(query = {}, patch) {
		console.log({ query, patch });

		if (patch.hasOwnProperty("index"))
			throw new Error("Index is 'immutable'");

		if (query.index && query.index === 0)
			throw new Error("The title row is 'immutable'");

		const docs = await this.find(query),
			updatedDocs = docs.map((doc) => {
				Object.keys(patch).forEach((key) => {
					doc[key] = patch[key];
				});

				return doc;
			});

		for (const doc of updatedDocs) {
			await sheets.spreadsheets.values.update({
				spreadsheetId: process.env.DS_SHEET_ID,
				range: this.getRange(doc.index),
				valueInputOption: "USER_ENTERED",
				resource: {
					values: [this.objectToValues(doc)],
				},
			});
		}

		return true;
	}

	async insert(body) {
		const docs = await this.find(),
			newIndex = docs.length;

		await sheets.spreadsheets.values.update({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.getRange(newIndex),
			valueInputOption: "USER_ENTERED",
			resource: {
				values: [this.objectToValues({ index: docs.length, ...body })],
			},
		});

		return true;
	}
}

import ObjectLib from "object-lib";
import dayjs from "dayjs";
import dotenv from "dotenv";
import sheets from "../sheets.js";
import sortByDateCreated from "./helpers/sortByDateCreated.js";
dotenv.config();

const PAGE_SIZE = 20,
	indexDisplacement = 2,
	protectImmutables = (query, patch) => {
		const immutables = ["index"];

		for (const prop of immutables) {
			if (patch[prop] !== undefined)
				throw new Error(`${prop} is immutable`);
		}

		if (query.index && query.index === 0)
			throw new Error("The title row is 'immutable'");
	};

export class Model {
	constructor(spreadsheetTitle) {
		this.spreadsheetTitle = spreadsheetTitle;
		this._methods = {};
	}

	get methods() {
		return this._methods;
	}
	set methods(methods) {
		// console.log({ name: newMethod.name, newMethod });

		this._methods = methods;
		// this[newMethod.name] = newMethod;
	}

	async init() {
		const {
			data: {
				values: [titleRow],
			},
		} = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: `${this.spreadsheetTitle}!A1:1`,
		});

		this.titleRow = titleRow;

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
			let v = values[index];

			if (["TRUE", "FALSE"].includes(v))
				r[value] = JSON.parse(v.toLowerCase());
			else r[value] = v;
		});

		return r;
	}

	async getNextIndex() {
		const { length } = await this.find();
		return length;
	}

	getRowFromIndex(index) {
		return index + indexDisplacement;
	}

	getCellRef(index, columnTitle) {
		const x = this.getColumnFromKey(columnTitle),
			y = this.getRowFromIndex(index);
		return `${this.spreadsheetTitle}!${x}${y}`;
	}

	getHorizontalLimits() {
		const xA = "A",
			xB = String.fromCharCode(
				xA.charCodeAt(0) + this.titleRow.length - 1
			);

		return [xA, xB];
	}

	getColumnFromKey(key) {
		const [xA] = this.getHorizontalLimits();

		return String.fromCharCode(
			xA.charCodeAt(0) + this.titleRow.indexOf(key)
		);
	}

	getRange(yA, yB) {
		const [xA, xB] = this.getHorizontalLimits();

		// Just get one row (probably the only use case)
		if (!yB) yB = yA;

		return `${this.spreadsheetTitle}!${xA}${this.getRowFromIndex(
			+yA
		)}:${xB}${this.getRowFromIndex(+yB)}`;
	}

	getRangeAll() {
		const [xA, xB] = this.getHorizontalLimits();

		// Ignore the top row (which contains the column titles)
		return `${this.spreadsheetTitle}!${xA}${indexDisplacement}:${xB}`;
	}

	async findByIndex(index, options = { preserveFormulae: false }) {
		const {
			data: { values },
		} = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.getRange(index),
			valueRenderOption: options.preserveFormulae
				? "FORMULA"
				: "FORMATTED_VALUE",
		});

		return this.valuesToObject(values[0]);
	}

	// Expects one or more query objects e.g. {index: 1}
	async find() {
		const queries = arguments.length ? [...arguments] : [{}];

		const {
			data: { values },
		} = await sheets.spreadsheets.values.get({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.getRangeAll(),
		});

		const docs = (values || []).map(this.valuesToObject.bind(this));
		let r = [];

		queries.forEach((query) => {
			r = [...r, ...docs.filter((doc) => ObjectLib.contains(doc, query))];
		});

		// Remove duplicates
		return [...new Set(r)];
	}

	async paginatedFind({ pageSize = PAGE_SIZE, ...query }, pageNumber) {
		const allDocs = (await this.find(query)).sort(sortByDateCreated),
			a = pageNumber * pageSize,
			b = a + pageSize,
			docs = allDocs.slice(a, b),
			totalPages = Math.ceil(allDocs.length / pageSize),
			nextPage = +pageNumber < totalPages ? +pageNumber + 1 : undefined;

		if (docs.length < 1) throw new Error("Page out of bounds");

		return { docs, nextPage, totalPages };
	}

	async updateByIndex(index, patch) {
		protectImmutables({ index }, patch);

		const doc = await this.findByIndex(index, { preserveFormulae: true });

		Object.keys(patch).forEach((key) => {
			doc[key] = patch[key];
		});

		await sheets.spreadsheets.values.update({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.getRange(index),
			valueInputOption: "USER_ENTERED",
			resource: {
				values: [this.objectToValues(doc)],
			},
		});

		return doc;
	}

	async update(query = {}, patch) {
		protectImmutables(query, patch);

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
		const nextIndex = await this.getNextIndex(),
			doc = {
				index: nextIndex,
				created_at: dayjs().format("DD/MM/YYYY"),
				...body,
			};

		await sheets.spreadsheets.values.append({
			spreadsheetId: process.env.DS_SHEET_ID,
			range: this.getRange(nextIndex),
			valueInputOption: "USER_ENTERED",
			resource: {
				values: [this.objectToValues(doc)],
			},
		});

		return { row: this.getRowFromIndex(nextIndex), ...doc };
	}
}

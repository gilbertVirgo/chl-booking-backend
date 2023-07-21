import Booking from "./Booking.js";
import { Model } from "../Model.js";
import dotenv from "dotenv";
dotenv.config();

const Customer = new Model("Customer");

Customer.methods.createFromForm = async function ({
	firstname,
	lastname,
	email,
	phone,
}) {
	const col = {};
	["index", "customer"].forEach(
		(key) => (col[key] = Booking.getColumnFromKey(key))
	);

	const { index } = await Customer.insert({
		firstname,
		lastname,
		email,
		phone,
	});

	// Update with formulas (which rely on having the row)
	return Customer.updateByIndex(index, {
		bookings: `=TEXTJOIN(",",TRUE,FILTER(Booking!${col.index}2:${
			col.index
		},Booking!${col.customer}2:${col.customer}=${
			col.index
		}${Customer.getRowFromIndex(index)}))`,
	});
};

export default Customer;

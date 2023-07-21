import Customer from "./Customer.js";
import { Model } from "../Model.js";
import dotenv from "dotenv";
dotenv.config();

const Booking = new Model("Booking");

Booking.methods.createFromForm = async function (body) {
	const {
		firstname,
		lastname,
		email,
		comments_or_questions,
		phone,
		group_size,
		potential_dates,
	} = body;

	let customer =
		(await Customer.find({ email }))[0] ||
		(await Customer.methods.createFromForm({
			firstname,
			lastname,
			email,
			phone,
		}));

	const col = {};
	["potential_dates", "status"].forEach(
		(key) => (col[key] = Booking.getColumnFromKey(key))
	);

	const r = await Booking.insert({
		customer: customer.index,
		customer_name: `=CONCATENATE(${Customer.getCellRef(
			customer.index,
			"firstname"
		)}, " ", ${Customer.getCellRef(customer.index, "lastname")})`,
		comments_or_questions,
		group_size,
		potential_dates,
		archived: "FALSE",
		status: "unconfirmed", // default
	});

	return r;
};

export default Booking;

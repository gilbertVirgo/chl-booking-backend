import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import { RecaptchaV3 as Recaptcha } from "express-recaptcha";

const recaptcha = new Recaptcha(
	process.env.RECAPTCHA_SITE,
	process.env.RECAPTCHA_SECRET
);

export default [
	{
		method: "get",
		route: "/booking/:index",
		action: (req) => Booking.findByIndex(req.params.index),
	},
	{
		method: "get",
		route: "/booking/:index/customer",
		action: async (req) => {
			const { customer: customerIndex } = await Booking.findByIndex(
				req.params.index
			);

			const customer = await Customer.findByIndex(customerIndex);
			return customer;
		},
	},

	{
		method: "get",
		route: "/bookings",
		action: (req) => Booking.find(req.query),
	},
	{
		method: "get",
		route: "/bookings/page/:pageNumber",
		action: (req) =>
			Booking.paginatedFind(req.query, req.params.pageNumber),
	},
	{
		secure: false,
		method: "put",
		route: "/booking",
		middleware: [recaptcha.middleware.verify],
		action: async ({ body }) => Booking.methods.createFromForm(body),
	},
	{
		method: "patch",
		route: "/booking/:index",
		action: (req) => Booking.updateByIndex(req.params.index, req.body),
	},
];

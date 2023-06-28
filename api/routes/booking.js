import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

export default [
	{
		method: "get",
		route: "/booking/:index",
		action: (req) => Booking.find({ index: req.params.index }),
	},
	{
		method: "get",
		route: "/booking/:index/customer",
		action: async (req) => {
			const { customer: customer_index } = await Booking.find({
				index: req.params.index,
			});
			const customer = await Customer.find({ index: customer_index });
			return customer;
		},
	},
	{
		method: "get",
		route: "/bookings",
		action: () => Booking.find(),
	},
	{
		method: "put",
		route: "/booking",
		action: (req) => Booking.insert(req.body),
	},
	{
		method: "patch",
		route: "/booking/:index",
		action: (req) => Booking.update({ index: req.params.index }, req.body),
	},
];

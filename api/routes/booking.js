import Booking from "../models/Booking.js";

export default [
	{
		method: "get",
		route: "/booking/:index",
		action: (req, res) => Booking.find({ index: req.params.index }),
	},
	{
		method: "get",
		route: "/bookings",
		action: (req, res) => Booking.find({}),
	},
	{
		method: "put",
		route: "/booking",
		action: (req, res) => Booking.insert(req.body),
	},
	{
		method: "patch",
		route: "/booking/:index",
		action: (req, res) =>
			Booking.update({ index: req.params.index }, req.body),
	},
];

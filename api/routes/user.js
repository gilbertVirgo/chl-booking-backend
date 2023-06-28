import User from "../models/User.js";

export default [
	{
		method: "get",
		route: "/user/:index",
		action: (req) => User.find({ index: req.params.index }),
	},
];

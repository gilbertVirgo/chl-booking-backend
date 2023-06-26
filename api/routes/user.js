import User from "../models/User.js";

export default [
	{
		method: "get",
		route: "/user/:index",
		action: (req, res) => User.find({ index: req.params.index }),
	},
];

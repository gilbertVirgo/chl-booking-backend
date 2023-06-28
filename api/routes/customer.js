import Customer from "../models/Customer";

export default [
	{
		method: "get",
		route: "/customer/:index",
		action: (req) => Customer.find({ index: req.params.index }),
	},
	{
		method: "get",
		route: "/customers",
		action: () => Customer.find(),
	},
	{
		method: "put",
		route: "/customer",
		action: (req) => Customer.insert(req.body),
	},
	{
		method: "patch",
		route: "/customer/:index",
		action: (req) => Customer.update({ index: req.params.index }, req.body),
	},
];

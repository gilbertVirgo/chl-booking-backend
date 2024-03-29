import booking from "./booking.js";
import createEventDescriptor from "../../helpers/createEventDescriptor.js";
import customer from "./customer.js";
import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import user from "./user.js";

const router = express.Router();
const routes = [...booking, ...user, ...customer];

routes.forEach(({ method, route, middleware = [], action, secure = true }) => {
	router[method](
		route,
		[isLoggedIn(secure), ...middleware],
		(req, res, next) => {
			Promise.resolve(action(req, res))
				.then((data) => {
					res.locals.data = data;
					res.locals.eventDescriptor = createEventDescriptor({
						method,
						route,
						secure,
					});
					next();
				})
				.catch(next);
		}
	);
});

export default router;

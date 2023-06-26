import booking from "./booking.js";
import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import user from "./user.js";

const router = express.Router();
const routes = [...booking, ...user];

routes.forEach(({ method, route, action, secure = true }) => {
	router[method](route, isLoggedIn(secure), async (req, res, next) => {
		res.locals.data = await action(req, res).catch(next);
		next();
	});
});

export default router;

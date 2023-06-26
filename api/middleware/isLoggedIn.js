import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export default (secure) => async (req, res, next) => {
	if (!secure) return next();

	const { authorization } = req.headers;

	if (!authorization) return next(new Error("No token"));

	const token = authorization.slice(7);

	const decoded = jwt.decode(token, { complete: true }),
		response = await User.find({
			email: decoded.payload.email,
		});

	if (!response.length) next(new Error("Invalid token"));

	try {
		jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		console.error(err.stack);
		next(new Error("Invalid token"));
	}

	next();
};

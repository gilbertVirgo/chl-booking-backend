import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const TokenError = new Error("Invalid or missing token");
TokenError.type = "TokenError";

export default (secure) => async (req, res, next) => {
	if (!secure) return next();

	const { authorization } = req.headers;

	if (!authorization) return next(TokenError);

	const token = authorization.slice(7);

	const decoded = jwt.decode(token, { complete: true }),
		response = await User.find({
			email: decoded.payload.email,
		});

	if (!response.length) next(TokenError);

	try {
		jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		console.error(err.stack);

		next(TokenError);
	}

	next();
};

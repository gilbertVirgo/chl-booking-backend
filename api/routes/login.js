import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import filterTokens from "../../helpers/filterTokens.js";
import jwt from "jsonwebtoken";

dotenv.config();

export default async ({ body }, res, next) => {
	const response = await User.find({ email: body.email });

	if (response.length === 0)
		throw new Error(`No user with that email (${body.email})`);

	const [user] = response,
		match = await bcrypt.compare(body.password, user.password);

	if (!match) throw new Error(`Incorrect password for ${body.email}`);

	user.tokens = filterTokens((user.tokens || "").split(",")).join(",");

	// Add new token
	const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		}),
		updatedTokens = (user.tokens ? user.tokens + "," : "") + token;

	await User.update({ index: user.index }, { tokens: updatedTokens });

	res.locals.data = { token };
	next();
};

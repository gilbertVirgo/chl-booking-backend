import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export default (tokens) =>
	tokens.filter((token) => {
		const decoded = jwt.decode(token, { complete: true });

		if (!decoded) return false;
		if (decoded.payload.exp * 1000 < Date.now()) return true;
	});

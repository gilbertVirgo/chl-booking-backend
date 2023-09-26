import dotenv from "dotenv";
import send from "gmail-send";
dotenv.config();

export default send({
	user: process.env.GMAIL_USER,
	pass: process.env.GMAIL_PASS,
});

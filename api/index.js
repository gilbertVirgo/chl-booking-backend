import Booking from "./models/Booking.js";
import Customer from "./models/Customer.js";
import User from "./models/User.js";
import boolParser from "express-query-boolean";
import cors from "cors";
import dotenv from "dotenv";
import error from "./middleware/error.js";
import express from "express";
import fs from "fs";
import https from "https";
import isLoggedIn from "./middleware/isLoggedIn.js";
import log from "../log.js";
import login from "./routes/login.js";
import ok from "./middleware/ok.js";
import router from "./routes/index.js";

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(boolParser());

server.post("/login", (req, res, next) => login(req, res, next).catch(next));
server.get("/session", isLoggedIn(true));
server.use(router);
server.use(ok);
server.use(error);

const init = async () => {
	await User.init();
	await Booking.init();
	await Customer.init();

	const { PORT } = process.env;

	// Non SSL option
	if (PORT != 443)
		server.listen(PORT, () => log("server", `Listening on ${PORT} ..`));

	// SSL option (used on deploy)
	const { SSL_PRIVATE_KEY_PATH, SSL_CERTIFICATE_PATH } = process.env;

	if (!SSL_PRIVATE_KEY_PATH || !SSL_CERTIFICATE_PATH)
		throw new Error("SSL cert paths not specified");

	https
		.createServer(
			{
				key: fs.readFileSync(SSL_PRIVATE_KEY_PATH),
				cert: fs.readFileSync(SSL_CERTIFICATE_PATH),
			},
			server
		)
		.listen(PORT);
};

init();

import Booking from "./models/Booking.js";
import Customer from "./models/Customer.js";
import User from "./models/User.js";
import boolParser from "express-query-boolean";
import cors from "cors";
import dotenv from "dotenv";
import error from "./middleware/error.js";
import express from "express";
import isLoggedIn from "./middleware/isLoggedIn.js";
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

	server.listen(process.env.PORT, () =>
		console.log(`Listening on ${process.env.PORT} ..`)
	);
};

init();

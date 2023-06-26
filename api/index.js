import Booking from "./models/Booking.js";
import User from "./models/User.js";
import booking from "./routes/booking.js";
import dotenv from "dotenv";
import error from "./middleware/error.js";
import express from "express";
import login from "./routes/login.js";
import ok from "./middleware/ok.js";
import router from "./routes/index.js";
dotenv.config();

const server = express();

server.use(express.json());

// Can't just go ("/login", login) unforunately because login is async
// and that means errors won't be caught by the middleware..
server.post("/login", (req, res, next) => login(req, res, next).catch(next));
server.use(router);
server.use(ok);
server.use(error);

const init = async () => {
	await User.init();
	await Booking.init();

	server.listen(process.env.PORT, () =>
		console.log(`Listening on ${process.env.PORT} ..`)
	);
};

init();

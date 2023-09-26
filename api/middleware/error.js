import log from "../../log.js";

export default (err, req, res, next) => {
	log("error", err.stack);

	res.status(500).json({
		success: false,
		message: err.toString(),
		type: err.type,
	});
};

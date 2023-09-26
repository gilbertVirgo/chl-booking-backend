import log from "../../log.js";

export default (req, res, next) => {
	if (res.locals.data)
		log("ok", JSON.stringify(res.locals.data), res.locals.eventDescriptor);

	res.status(200).json({ success: true, data: res.locals.data || null });
};

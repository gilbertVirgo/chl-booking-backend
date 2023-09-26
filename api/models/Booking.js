import Customer from "./Customer.js";
import { Model } from "../Model.js";
import calendar from "../../google/calendar.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import dayjs from "dayjs";
import dotenv from "dotenv";
import log from "../../log.js";
import notificationToAdmin from "../email-templates/notification-to-admin.js";
import notificationToCustomer from "../email-templates/notification-to-customer.js";
import sendEmail from "../../google/mail.js";

dayjs.extend(customParseFormat);

dotenv.config();

const Booking = new Model("Booking");

Booking.methods.sendNotificationEmailToCustomer = async function (index) {
	const { customer: customer_index, group_size } = await Booking.findByIndex(
		index
	);
	const { email, firstname } = await Customer.findByIndex(customer_index);

	sendEmail({
		to: email,
		subject: `Christian Heritage London walk with ${firstname}`,
		from: "info@christianheritagelondon.org",
		text: notificationToCustomer({ firstname, group_size }),
	}).then(log.bind(null, "mail"));
};

Booking.methods.sendNotificationEmailToAdmin = async function (index) {
	const booking = await Booking.findByIndex(index);

	sendEmail({
		to: "gil@christianheritagelondon.org",
		subject: `Booking from ${booking.customer_name}`,
		from: "noreply@christianheritagelondon.org",
		text: notificationToAdmin(booking),
	}).then(log.bind(null, "mail"));
};

Booking.methods.addToCalendar = async function (index) {
	const { confirmed_date, customer_name, customer, group_size } =
		await Booking.findByIndex(index);

	if (!confirmed_date)
		throw new Error("No confirmed date. Cannot add to calendar");

	const response = await calendar.Events.insert(
		process.env.GOOGLE_CALENDAR_ID,
		{
			start: {
				dateTime: dayjs(confirmed_date, "DD/MM/YYYY").hour(10).format(),
			},
			end: {
				dateTime: dayjs(confirmed_date, "DD/MM/YYYY").hour(16).format(),
			},
			summary: `LD ${customer_name} +${group_size - 1}`,
			description: `Customer info at https://cms.christianheritagelondon.org/customer/${customer}. (This calendar event was created by the booking system)`,
		}
	);

	return response;
};

Booking.methods.createFromForm = async function (body) {
	const {
		firstname,
		lastname,
		email,
		comments_or_questions,
		phone,
		group_size,
		potential_dates,
	} = body;

	let customer =
		(await Customer.find({ email }))[0] ||
		(await Customer.methods.createFromForm({
			firstname,
			lastname,
			email,
			phone,
		}));

	const col = {};
	["potential_dates", "status"].forEach(
		(key) => (col[key] = Booking.getColumnFromKey(key))
	);

	const response = await Booking.insert({
		customer: customer.index,
		customer_name: `=CONCATENATE(${Customer.getCellRef(
			customer.index,
			"firstname"
		)}, " ", ${Customer.getCellRef(customer.index, "lastname")})`,
		comments_or_questions,
		group_size,
		potential_dates,
		archived: "FALSE",
		status: "unconfirmed", // default
	});

	return response;
};

Booking.methods.findInDateRange = async (start, end, query = {}) => {
	const f = "DD/MM/YYYY";

	const datesInRange = Array(dayjs(end, f).diff(dayjs(start, f), "day"))
		.fill(null)
		.map((v, i) => dayjs(start, f).add(i, "day").format(f));
	const bookingsInRange = (await Booking.find(query)).filter(
		({ potential_dates }) =>
			potential_dates.split(",").some((d) => datesInRange.includes(d))
	);

	return bookingsInRange;
};

export default Booking;

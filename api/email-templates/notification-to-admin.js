export default (booking) =>
	`🅝🅔🅦 🅑🅞🅞🅚🅘🅝🅖
Name: ${booking.customer_name}
Group size: ${booking.group_size}
Date(s): ${booking.potential_dates.split(",").join(", ")}
Comments/Questions: ${booking.comments_or_questions}
___\n\n

https://cms.christianheritagelondon.org/bookings/cards
`;

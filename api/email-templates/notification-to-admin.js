export default (booking) =>
	`🅝🅔🅦 🅑🅞🅞🅚🅘🅝🅖
Name: ${booking.customer_name}
Group size: ${booking.group_size}
Date(s): ${booking.potential_dates.split(",").join(", ")}
Comments/Questions: ${booking.comments_or_questions}
___

https://cms.christianheritagelondon.org/customer/${booking.customer}
`;

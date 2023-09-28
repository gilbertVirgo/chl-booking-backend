export default ({ firstname, group_size }) => `Dear ${firstname},

Thank you for getting in touch.

${
	+group_size >= 4
		? `We will aim to confirm your booking as soon as possible.`
		: `Our minimum group size is four people, so we will make provisional bookings for the date(s) that you have requested and will confirm when others approach us.`
}

Christian Heritage London

___
Remember your leaders, who spoke the word of God to you. Consider the outcome of their way of life and imitate their faith. (Hebrews 13:7)`;

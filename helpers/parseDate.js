export default (ddmmyyyyDate) => {
	const [day, month, year] = ddmmyyyyDate.split("/");
	return new Date(year, month - 1, day);
};

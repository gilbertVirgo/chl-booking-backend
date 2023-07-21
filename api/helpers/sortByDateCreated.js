import parseDate from "./parseDate.js";

export default ({ created_at: a }, { created_at: b }) =>
	parseDate(b) - parseDate(a);

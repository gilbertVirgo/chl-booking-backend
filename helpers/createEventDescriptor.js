import ellipsize from "ellipsize";
import pad from "pad";

const ellipsipad = (string, length) => {
	return pad(length, ellipsize(string, length));
};

export default ({ method, route, secure }) =>
	" " +
	[
		[method, 5],
		[route, 20],
		[`secure=${secure}`, 12],
	]
		.map(([string, length]) => ellipsipad(string, length))
		.join(" ") +
	" ";

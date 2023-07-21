import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import S3RW from "s3-read-write";
import dotenv from "dotenv";
import multipleFileUpload from "../middleware/multipleFileUpload.js";
import uniqid from "uniqid";
dotenv.config();

export default [
	{
		method: "get",
		route: "/customer/:index",
		action: (req) => Customer.find({ index: req.params.index }),
	},
	{
		method: "get",
		route: "/customer/:index/bookings",
		action: async (req) => {
			const { bookings: bookingIndices } = await Customer.findByIndex(
				req.params.index
			);

			const bookings = await Booking.find(
				...bookingIndices.split(",").map((index) => ({ index }))
			);
			return bookings;
		},
	},
	{
		method: "get",
		route: "/customers",
		action: (req) => Customer.find(req.query),
	},
	{
		method: "get",
		route: "/customers/page/:pageNumber",
		action: (req) =>
			Customer.paginatedFind(req.query, req.params.pageNumber),
	},
	{
		method: "put",
		route: "/customer",
		action: (req) => Customer.insert(req.body),
	},

	{
		method: "patch",
		route: "/customer/:index",
		action: (req) => Customer.updateByIndex(req.params.index, req.body),
	},
	{
		method: "patch",
		route: "/customer/:index/images",
		middleware: [multipleFileUpload],
		action: async ({ files: { images: files }, params: { index } }) => {
			if (!Array.isArray(files)) files = [files];

			const s3BucketURL = "https://chlmedia.s3.eu-west-2.amazonaws.com",
				{
					AWS_ACCESS_KEY_ID: accessKeyId,
					AWS_SECRET_ACCESS_KEY: secretAccessKey,
					AWS_BUCKET: Bucket,
				} = process.env,
				s3 = new S3RW({ accessKeyId, secretAccessKey, Bucket }),
				fileNames = files.map(
					({ mimetype }) => `${uniqid()}.${mimetype.split("/")[1]}`
				);

			await Promise.all(
				files.map((image, i) => s3.write(image.data, fileNames[i]))
			);

			const images =
				(await Customer.findByIndex(index)).images?.split(",") || [];

			return Customer.updateByIndex(index, {
				images: [
					...images,
					...fileNames.map(
						(fileName) => `${s3BucketURL}/${fileName}`
					),
				].join(","),
			});
		},

		// Don't forget to compress images significantly on the client side
	},
];

import fs from "fs";
import parseMongoData from "./parse-mongo-data.js";

fs.writeFileSync(
	"./parsed-output.js",
	JSON.stringify(parseMongoData("./output.json")),
	{ encoding: "utf-8" }
);

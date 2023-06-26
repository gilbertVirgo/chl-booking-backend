import bcrypt from "bcrypt";
import dotenv from "dotenv";
import promptSync from "prompt-sync";
dotenv.config();

const prompt = promptSync(),
	password = prompt("Enter your password.. ");

console.log(
	"Hash: ",
	bcrypt.hashSync(password, +process.env.BCRYPT_SALT_ROUNDS)
);

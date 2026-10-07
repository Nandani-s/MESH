// One-off script to promote a user to admin.
// Run from your backend project root:
//   node scripts/makeAdmin.js your-email@example.com

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { User } from "../models/user.js";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

const email = process.argv[2];

if (!email) {
	console.error("Usage: node scripts/makeAdmin.js your-email@example.com");
	process.exit(1);
}

const run = async () => {
	await connectDB();

	const user = await User.findOneAndUpdate(
		{ email: email.toLowerCase().trim() },
		{ $set: { role: "admin" } },
		{ new: true }
	).select("-password");

	if (!user) {
		console.error(`No user found with email "${email}"`);
	} else {
		console.log(`✅ ${user.email} is now an admin (role: ${user.role})`);
	}

	await mongoose.disconnect();
	process.exit(user ? 0 : 1);
};

run();
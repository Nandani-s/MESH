// Migration: pull every externally-hosted product/category image into
// Cloudinary and store the resulting URL + publicId in the database.
//
// Run from the backend project root:
//   node scripts/migrateImagesToCloudinary.js
//
// Idempotent — docs that already have an `imagePublicId` are skipped.

import dotenv from "dotenv";
import mongoose from "mongoose";
import { mkdir, writeFile, unlink, access } from "fs/promises";
import connectDB from "../config/db.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
import { Settings } from "../models/settings.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

dotenv.config({ path: "./.env" });

const tmpDir = "./node_modules/.mesh-img-tmp";
const isRemote = (url) => typeof url === "string" && /^https?:\/\//.test(url);

const slugify = (s) =>
	s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const download = async (url) => {
	const res = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0 (MESH storefront init)" },
	});
	if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	return buf;
};

const migrate = async (collection, doc, field = "image") => {
	// Already hosted on Cloudinary — nothing to do (don't rely on imagePublicId,
	// which admin re-saves can strip).
	if (doc.image && doc.image.startsWith("https://res.cloudinary.com")) return false;
	if (doc[field] && isRemote(doc[field])) {
		try {
			const bytes = await download(doc[field]);
			const filePath = `${tmpDir}/${doc._id}.img`;
			await writeFile(filePath, bytes);
			const result = await uploadOnCloudinary(filePath);
			if (result) {
				const update = {
					[field]: result.secure_url,
					imagePublicId: result.public_id,
				};
				await collection.findOneAndUpdate({ _id: doc._id }, { $set: update }, { new: true });
				console.log(`  ✓ ${doc.name || doc._id}  ->  ${result.public_id}`);
				return true;
			}
		} catch (e) {
			console.log(`  ✗ ${doc.name || doc._id}: ${e.message}`);
		}
	}
	return false;
};

const run = async () => {
	await connectDB();
	await mkdir(tmpDir, { recursive: true });

	let migrated = 0;

	console.log("— Products —");
	const products = await Product.find().lean();
	for (const p of products) {
		if (await migrate(Product, p)) migrated += 1;
	}

	console.log("— Categories —");
	const categories = await Category.find().lean();
	for (const c of categories) {
		if (await migrate(Category, c)) migrated += 1;
	}

	console.log("— Settings —");
	const settings = await Settings.findById("store_settings").lean();
	if (settings) await migrate(Settings, settings);

	console.log(`\nMigrated ${migrated} image(s) to Cloudinary.`);
	await mongoose.disconnect();
};

run();
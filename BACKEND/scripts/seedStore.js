// Seed script: admin user + categories + products.
// Run from the backend project root:
//   node scripts/seedStore.js
//
// Idempotent — safe to run again (updates existing docs, never duplicates).

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";

dotenv.config({ path: "./.env" });

const px = (id, w = 900) =>
	`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const CATEGORIES = [
	{ name: "Dresses", slug: "dresses", description: "Flowy, sculpted and everyday-elegant dresses in the MESH palette.", image: px(33408915) },
	{ name: "Tops & Blouses", slug: "tops-and-blouses", description: "Essential tops and blouses, from crisp linen to soft knits.", image: px(33388006) },
	{ name: "Coats & Jackets", slug: "coats-and-jackets", description: "Tailored outerwear designed to carry you through every season.", image: px(18904209) },
	{ name: "Skirts", slug: "skirts", description: "Midi, mini and everything in between — cut for movement.", image: px(21286431) },
	{ name: "Accessories", slug: "accessories", description: "Bags, belts and finishing touches for every outfit.", image: px(28470200) },
	{ name: "Anime Collection", slug: "anime-collection", description: "Anime-inspired streetwear — graphic jerseys, printed tees and cozy layers for fans of bold style.", image: px(32660542) },
	{ name: "Jersey Collection", slug: "jersey-collection", description: "Club and country jerseys — Barca, Argentina, Brazil and Inter Miami kits for match day and every day.", image: px(16678677) },
];

const PRODUCTS = [
	{
		name: "Emerald Wrap Midi Dress",
		description: "A fluid wrap midi in signature emerald satin. V-neckline, tie waist and a skirt that moves with you — from desk to dinner.",
		brand: "MESH Studio", category: "Dresses", price: 4590, originalPrice: 5990, availability: "InStock", stock: 20,
		image: px(33956637),
	},
	{
		name: "Ivory Linen Button-Up Blouse",
		description: "Breathable 100% linen blouse with a relaxed fit, mother-of-pearl buttons and a soft collar. The cornerstone of any capsule wardrobe.",
		brand: "MESH", category: "Tops & Blouses", price: 2790, originalPrice: 3290, availability: "InStock", stock: 35,
		image: px(3998648),
	},
	{
		name: "The Classic Tailored Trench",
		description: "A structured trench with a storm flap, buckled belt and clean tailoring. Rain-ready, always elegant.",
		brand: "MESH Studio", category: "Coats & Jackets", price: 7200, originalPrice: 8990, availability: "InStock", stock: 12,
		image: px(18904209),
	},
	{
		name: "City Stride Midi Dress",
		description: "An effortless midi dress made for city days. Soft drape, thoughtful pockets and a hemline that stays put.",
		brand: "MESH", category: "Dresses", price: 3850, originalPrice: 4290, availability: "PreOrder", stock: 18,
		image: px(4676634),
	},
	{
		name: "Bloom Floral Midi Skirt",
		description: "A twirl-worthy floral midi skirt with a wide waistband and full swing. Pairs with everything in our knit collection.",
		brand: "MESH", category: "Skirts", price: 3350, originalPrice: 3900, availability: "InStock", stock: 25,
		image: px(21286431),
	},
	{
		name: "Studio Rib Knit Top",
		description: "Close-fitting ribbed knit in rich charcoal. Feels like a second skin and layers like a dream.",
		brand: "MESH Studio", category: "Tops & Blouses", price: 2990, originalPrice: 3590, availability: "InStock", stock: 40,
		image: px(34163160),
	},
	{
		name: "Summer Essentials Clutch",
		description: "A roomy woven clutch for warm-weather days — holds your essentials with room to spare.",
		brand: "MESH Accessories", category: "Accessories", price: 1990, originalPrice: 2490, availability: "InStock", stock: 30,
		image: px(5405644),
	},
	{
		name: "Golden Hour Silk Dress",
		description: "A champagne silk dress that catches the light. Bias cut, adjustable straps, effortless evening elegance.",
		brand: "MESH Studio", category: "Dresses", price: 4590, originalPrice: 5290, availability: "InStock", stock: 10,
		image: px(9563080),
	},
	{
		name: "Cypress Satin Slip Dress",
		description: "A bias-cut satin slip in deep cypress green. Minimal lines, maximum impact.",
		brand: "MESH", category: "Dresses", price: 4190, originalPrice: 4890, availability: "InStock", stock: 15,
		image: px(38579533),
	},
	{
		name: "Coastal Linen Separates Set",
		description: "Breezy linen separates in soft waves — effortless for warm days and easy to mix and match.",
		brand: "MESH", category: "Accessories", price: 2390, originalPrice: 2990, availability: "OutOfStock", stock: 0,
		image: px(38581934),
	},
	{
		name: "Anime Sports Jersey",
		description: "A lightweight anime-inspired sports jersey with a bold number print. Breathable fabric, relaxed fit — built for match day and con floors.",
		brand: "MESH Pop", category: "Anime Collection", price: 2990, originalPrice: 3490, availability: "InStock", stock: 25,
		image: px(26646872),
	},
	{
		name: "Anime Graphic T-Shirt",
		description: "A soft cotton tee stacked with vivid anime-era graphics. Boxy cut, ribbed neck, instant outfit energy.",
		brand: "MESH Pop", category: "Anime Collection", price: 1990, originalPrice: 2490, availability: "InStock", stock: 40,
		image: px(36074834),
	},
	{
		name: "Anime Oversized Hoodie",
		description: "An oversized hoodie in playful pink-purple tones. Brushed fleece inside, roomy pocket, cozy beyond compare.",
		brand: "MESH Pop", category: "Anime Collection", price: 3490, originalPrice: 3990, availability: "InStock", stock: 20,
		image: px(12944791),
	},
	{
		name: "Anime Street Sweatshirt",
		description: "A crew-neck sweatshirt in bright character hues — warm, roomy and made for late-night marathons.",
		brand: "MESH Pop", category: "Anime Collection", price: 3190, originalPrice: 3690, availability: "PreOrder", stock: 15,
		image: px(5706277),
	},
	{
		name: "FC Barcelona Home Jersey",
		description: "The iconic blaugrana home jersey in deep blue with club crest detailing. Sweat-wicking knit, fan-version fit.",
		brand: "MESH Field", category: "Jersey Collection", price: 4990, originalPrice: 5990, availability: "InStock", stock: 18,
		image: px(18256104),
	},
	{
		name: "Argentina National Home Jersey",
		description: "La Albiceleste stripes in sky blue and white — classic collar, lightweight match fabric, national pride.",
		brand: "MESH Field", category: "Jersey Collection", price: 4790, originalPrice: 5490, availability: "InStock", stock: 22,
		image: px(35832019),
	},
	{
		name: "Brazil National Home Jersey",
		description: "The Seleção yellow with green trim — iconic canarinho look in breathable performance knit.",
		brand: "MESH Field", category: "Jersey Collection", price: 4790, originalPrice: 5490, availability: "InStock", stock: 22,
		image: px(36572129),
	},
	{
		name: "Inter Miami CF Home Jersey",
		description: "Inter Miami pink in a clean minimalist cut — soft-touch fabric, subtle crest, Miami nights ready.",
		brand: "MESH Field", category: "Jersey Collection", price: 4590, originalPrice: 5290, availability: "InStock", stock: 20,
		image: px(8386642),
	},
];

const run = async () => {
	await connectDB();

	// Drop stale unique `slug` index if present — not part of the current Product schema.
	try {
		await Product.collection.dropIndex("slug_1");
		console.log("✓ Dropped stale 'slug_1' index on products");
	} catch {
		// index does not exist — nothing to do
	}

	// --- Admin user (upsert) ---
	const adminEmail = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD || "MESH@admin123";
	if (!adminEmail) {
		console.error("ADMIN_EMAIL is not set in .env — skipping admin user.");
	} else {
		const hashed = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ email: adminEmail.toLowerCase().trim() },
			{ $set: { name: "MESH Admin", password: hashed, role: "admin", status: "active", phone: "9800000000" } },
			{ upsert: true, new: true }
		);
		console.log(`✓ Admin ready: ${adminEmail}  (password: ${password})`);
	}

	// --- Categories (upsert by slug) ---
	// Preserve any existing image (e.g. migrated to Cloudinary) — never revert
	// to the seed's placeholder URLs on re-runs.
	for (const c of CATEGORIES) {
		const existing = await Category.findOne({ slug: c.slug });
		if (existing) {
			const set = { name: c.name, description: c.description, status: "active" };
			if (existing.image) set.image = existing.image;
			else set.image = c.image;
			await Category.updateOne({ _id: existing._id }, { $set: set });
		} else {
			await Category.create({ ...c, status: "active" });
		}
	}
	console.log(`✓ Categories ready: ${CATEGORIES.map((c) => c.name).join(", ")}`);

	// --- Products (upsert by name) ---
	for (const p of PRODUCTS) {
		const existing = await Product.findOne({ name: p.name });
		if (existing) {
			const set = {
				description: p.description,
				brand: p.brand,
				category: p.category,
				price: p.price,
				originalPrice: p.originalPrice,
				availability: p.availability,
				stock: p.stock,
				priceCurrency: "RS",
			};
			if (existing.image) set.image = existing.image;
			else set.image = p.image;
			await Product.updateOne({ _id: existing._id }, { $set: set });
		} else {
			await Product.create({
				...p,
				priceCurrency: "RS",
				aggregateRating: { ratingValue: 4.7, reviewCount: Math.floor(Math.random() * 20) + 3 },
			});
		}
	}
	console.log(`✓ Products ready: ${PRODUCTS.length} items across ${new Set(PRODUCTS.map((p) => p.category)).size} categories`);

	await mongoose.disconnect();
	console.log("Seed complete.");
};

run();
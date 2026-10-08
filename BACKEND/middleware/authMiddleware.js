import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const extractToken = (req) => {
	const cookieToken = req.cookies?.accesstoken;
	if (cookieToken) {
		return cookieToken;
	}

	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
		return authHeader.slice(7).trim();
	}

	return null;
};

const verifyUser = async (req, res, next) => {
	try {
		const token = extractToken(req);
		if (!token) {
			return res.status(401).json({
				message: "Unauthorized, Please login to access this resource",
			});
		}

		const secret = process.env.JWT_SECRET_KEY;
		if (!secret) {
			console.error("JWT_SECRET_KEY is missing");
			return res.status(500).json({
				message: "Server configuration error",
			});
		}

		const decoded = jwt.verify(token, secret);
		const user = await User.findById(decoded?.id || decoded?._id).select("-password");
		if (!user) {
			return res.status(401).json({
				message: "Unauthorized, User not found for this token",
			});
		}

		req.user = user;
		next();
	} catch (error) {
		if (
			error?.name === "TokenExpiredError" ||
			error?.name === "JsonWebTokenError" ||
			error?.name === "NotBeforeError"
		) {
			return res.status(401).json({
				message: "Unauthorized, Invalid or expired token",
			});
		}

		console.error("Auth middleware error:", error);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

// Must run AFTER verifyUser (relies on req.user being set). Blocks anyone
// whose role isn't "admin" — separate from authentication (verifyUser) so
// "are you logged in" and "are you allowed to do this" stay independent checks.
const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			message: "Unauthorized, Please login to access this resource",
		});
	}
	if (req.user.role !== "admin") {
		return res.status(403).json({
			message: "Forbidden, Admin access required",
		});
	}
	next();
};

export default verifyUser;
export { requireAdmin };
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const verifyUser = async (req, res, next) => { // ye middleware function hai, jo har request ke sath chalta hai, aur user ko verify krta hai, agar user valid hai to next() call krta hai, nhi to error return krta hai
	try {
		const token = req.cookies.accesstoken // client se cookie me se token nikalna hai
        console.log("token from cookie", token);
		if (!token) {
			return res.status(401).json({
				message: "Unauthorized, Please login to access this resource",
			})
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // jwt.verify() function token ko verify krta hai, agar token valid hai to decoded data return krta hai, nhi to error throw krta hai
		console.log("decoded", decoded);
		const user = await User.findById(decoded?.id).select("-password") // user ke data me se password ko exclude krna hai, taki security badh sake
		if (!user) {
			return res.status(401).json({
				message: "Unauthorized, User not found for this token",
			})
		}

          req.user = user // agar user valid hai to req.user me user ka data store krna hai, taki aage ke controllers me use kr sake

		next() // agar token valid hai to next() call krna hai, taki request aage badh sake
	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})

	}
}

export default verifyUser;
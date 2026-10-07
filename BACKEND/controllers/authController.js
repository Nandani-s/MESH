import bcrypt from "bcrypt"
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import generateOtp from "../utils/generateOtp.js";
import { sendLoginOtp, sendResetOtp } from "../utils/sendEmail.js";


const accessTokensecret = async (user) => {// ye function user ke data ko token me convert krta hai, taki usko verify kr sake ki user kaun hai, aur uske pass kya permissions hai

	return jwt.sign(
		{
			id: user._id,
			name: user.name,
			email: user.email,
			phone : user.phone,
		},
		process.env.JWT_SECRET_KEY,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	)
};
// ─── LOGIN OTP ───

// POST /api/user/login-otp-request
// Step 1: User submits email, we send OTP
const requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to user
    user.loginOtp = otp;
    user.loginOtpExpiry = expiry;
    await user.save();

    // Send email
    await sendLoginOtp(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Valid for 10 minutes.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/login-otp-verify
// Step 2: User submits email + OTP, we verify and log them in
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check OTP
    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > user.loginOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // Clear OTP
    user.loginOtp = null;
    user.loginOtpExpiry = null;
    await user.save();

    // Generate JWT and set cookie (same as your existing login)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "5d" }
    );

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── FORGOT PASSWORD OTP ───

// POST /api/user/forgot-password
// Step 1: User submits email, we send reset OTP
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security: don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    // Send email
    await sendResetOtp(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Valid for 10 minutes.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/reset-password
// Step 2: User submits email + OTP + new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check OTP
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Converts strings like "5d", "12h", "30m" into milliseconds for the cookie maxAge.
// Falls back to 5 days if JWT_EXPIRES_IN is missing or in an unexpected format.
const parseExpiryToMs = (expiry) => {
	const match = /^(\d+)([smhd])$/.exec(expiry || "");
	if (!match) return 5 * 24 * 60 * 60 * 1000;
	const value = Number(match[1]);
	const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
	return value * unitMs[match[2]];
};

// Shared cookie options so login/logout always match (mismatched options can
// cause clearCookie() to silently fail to remove the cookie set by login).
const accessTokenCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production", // secure cookies require HTTPS; allow plain http in dev
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	maxAge: parseExpiryToMs(process.env.JWT_EXPIRES_IN),
};



const register = async (req, res) => {
	
	try {
		
		const { name, email, password, phone } = req.body
		// IMPORTANT: role is intentionally NOT read from req.body. If a client could
		// pass `role: "admin"` at signup, anyone could self-promote to admin.
		// New users always get the schema default ("user"); promote to admin
		// via a trusted internal path only (e.g. directly in the database).


		if (!name || !email || !password || !phone) {
			return res.status(400).json({ message: "All fields are required" })
		}


		const existingUser = await User.findOne({ email }) // paila check krna h ki user exist krta hai ya nhi, nhi to create krna hai, agar exist krta hai to error dena hai
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" })
		}
		
		const newpassword = await bcrypt.hash(password, 10) // 10 is the number of rounds for hashing, it determines how many times the hashing algorithm will be applied to the password. Higher rounds means more security but also more time to hash and verify passwords.

		const user = await User.create({
			name,
			email,
			password: newpassword,
			phone,
		
		})

		if (!user) {
			return res.status(400).json({ message: "User registration failed" })
		}

		res.status(201).json({
			message: "User registered successfully",
			username: user.name
		})


	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})

	}
}


const login = async (req, res) => {
   
	try {
		const { password, email } = req.body

		if (!password || !email) {
			return res.status(400).json({
				message: "all feilds are required"
			})
		}


		const user = await User.findOne({ email })
		
		if (!user) {
			return res.status(400).json({
				message: "user not found"
			})
		}

		
		const ispasswordcorrect = await bcrypt.compare(password, user.password);
		if (!ispasswordcorrect) {
			return res.status(401).json({
				message: "password invalid"
			})
		}

		const accessToken = await accessTokensecret(user);//ye function user ke data ko token me convert krta hai, taki usko verify kr sake ki user kaun hai, aur uske pass kya permissions hai

		return res.status(200).cookie('accesstoken', accessToken, accessTokenCookieOptions)
			.json({
				message: "login success",
				AccessToken: accessToken,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					phone: user.phone,
					role: user.role,
				},
			})

	} catch (error) {
		return res.status(500).json({
			message: "internal error",
			error: error.message
		})
	}
};

const auth = async (req, res) => {
	try {


		const user = req.user // verifyUser middleware me req.user me user ka data store kiya hai, usko yaha se access krna hai
		res.json({
			message: "auth controller is working",
			data: user
		})


	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})
	}
};

const byid = async (req, res) => {
	try {
		const id = req.params.id
		if (!id) {
			return res.status(400).json({
				message: "id is required"
			})
		}

		const user = await User.findById(id).select("-password")
		if (!user) {
			return res.status(404).json({
				message: "user not found"
			})
		}

		return res.status(200).json({
			message: "user Found",
			data: user
		})


	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})
	}
}


const logout = async (req, res) => {
	try {
		return res.status(200).clearCookie('accesstoken', accessTokenCookieOptions)
			.json({
				message: "user logged out successfully",

			})


	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})
	}
}

const allusers = async (req, res) => {
	try {
		const Users = await User.find().select("-password")
		if (!Users) {
			return res.status(404).json({
				message: "no user found"

			})
		}

		return res.status(200).json({
			message: "users found",
			data: Users,
			TotalUser: Users.length
		})

	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
		})
	}
}

const deleteuser = async (req, res) => {
	try {
		const { id } = req.params

		if (!id) {
			return res.status(400).json({
				message: "id is required"
			})
		}

		const user = await User.findByIdAndDelete(id)
		if (!user) {
			return res.status(404).json({
				message: "user not found"
			})
		}
		return res.status(200).json({
			message: "user deleted successfully",
			data: user
		})
	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		})
	}
}

// Update user — admin can change name, phone, role, status
const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, phone, role, status } = req.body;

		// Never allow password to be changed through this endpoint
		const user = await User.findByIdAndUpdate(
			id,
			{ ...(name && { name }), ...(phone && { phone }), ...(role && { role }), ...(status && { status }) },
			{ new: true, runValidators: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({ message: "user not found" });
		}

		return res.status(200).json({
			message: "user updated successfully",
			data: user
		});
	} catch (error) {
		return res.status(500).json({
			message: "Internal server error",
			error: error.message
		});
	}
};

export {
	register,
	login,
	auth,
	byid,
	logout,
	allusers,
	deleteuser,
	updateUser,
	 requestLoginOtp,
  verifyLoginOtp,
  requestPasswordReset,
  resetPassword,
}
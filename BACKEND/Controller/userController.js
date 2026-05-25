import bcrypt from "bcrypt"
import { User } from "../models/User.model.js"
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";


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



const register = async (req, res) => {
    
    try {
        
        const { name, email, password, phone } = req.body


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
            return res.json({
                message: "password invalid"
            })
        }

        const accessToken = await accessTokensecret(user);//ye function user ke data ko token me convert krta hai, taki usko verify kr sake ki user kaun hai, aur uske pass kya permissions hai
        
        return res.status(201).cookie('accesstoken', accessToken, {
            httpOnly: true,
            secure: true //normal attacks se bachav krta hai, https ke sath use krna chahiye 
        })
            .json({
                message: "login success  ",
                AccessToken: accessToken,

            })

    } catch (error) {
        return res.json({
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
        return res.status(201).clearCookie('accesstoken', {
            httpOnly: true,
            secure: true //normal attacks se bachav krta hai, https ke sath use krna chahiye 
        })
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
        const user = await User.deleteMany()
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

export {
    register,
    login,
    auth,
    byid,
    logout,
    allusers,
    deleteuser
}

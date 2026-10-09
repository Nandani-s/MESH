import { Router } from "express";
import { register ,login, auth, byid, logout, allusers, deleteuser, updateUser, uploadProfileAvatar} from "../controllers/authController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js";
import {

  requestLoginOtp,
  verifyLoginOtp,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";






const userRoute = Router();

userRoute.route('/register').post(register)
userRoute.route('/login').post(login)
userRoute.route('/auth').get(verifyUser,auth)
userRoute.route('/profile/avatar').put(verifyUser, upload.single("avatar"), uploadProfileAvatar)
userRoute.route("/byid/:id").get(byid)
userRoute.route("/logout").post(logout)
userRoute.route("/alluser").get(verifyUser,requireAdmin,allusers)
userRoute.route("/update/:id").put(verifyUser,requireAdmin,updateUser)
userRoute.route("/delete/:id").delete(verifyUser,requireAdmin,deleteuser)
// ─── Login OTP ───
userRoute.route("/login-otp-request").post(requestLoginOtp);
userRoute.route("/login-otp-verify").post(verifyLoginOtp);

// ─── Forgot Password ───
userRoute.route("/forgot-password").post(requestPasswordReset);
userRoute.route("/reset-password").post(resetPassword);


export default userRoute;
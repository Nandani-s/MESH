import mongoose from "mongoose";
const user = new mongoose.Schema({
	name:{
		type:String,
		required:true,
	},
	email:{	
		type:String,
		required:true,
		unique:true,
		lowercase:true,
		trim:true,
	},
	role:{
		type:String,
		enum:["user","admin"],
		default:"user",
	},
	status:{
		type:String,
		enum:["active","inactive"],
		default:"active",
	},
	password:{
		type:String,
		required:true,
	},
	phone:{
		type:String,
		required:true,
	},
	lastLoginAt:{
		type:Date,
		default:null,
	},
	avatar:{
		type:String,
		
	},
	avatarPublicId:{
		type:String,
	},
	loginOtp: {
		 type: String, 
		 default: null },
  loginOtpExpiry: { 
	type: Date,
	 default: null },
  resetOtp: {
	 type: String,
	 default: null },
  resetOtpExpiry: {
	 type: Date,
	  default: null },

},{timestamps:true});	
export const User= mongoose.model("user",user)
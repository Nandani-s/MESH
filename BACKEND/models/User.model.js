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
		lowwercase:true,
	},
	password:{
		type:String,
		required:true,
	},
	phone:{
		type:String,
		required:true,
	},
	avatar:{
		type:String,
		
	}
},{timestamps:true});	
export const User= mongoose.model("user",user) 
import bcryptjs from 'bcryptjs'
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"

import { userModel } from "../models/userModel.js";

export const register = async (req, res) => {
  const {email, password, name, phone} = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required." })
    }
    const userAlreadyExists = await userModel.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ 
        success: false, message: "User already exists" 
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new userModel({
      email, 
      password: hashedPassword,
      name,
      phone: phone || "",
    });

    await user.save();

    // Optional: log the user in immediately
    // generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


export const login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" })
    };
    
    const isPasswordTrue = await bcryptjs.compare(password, user.password);
    if (!isPasswordTrue) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    };

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
	res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const checkAuth = async (req, res) => {
	try {
		const user = await userModel.findById(req.userId).select("-password");
		if (!user) {
			return res.status(401).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "30d", // optional: matches cookie
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "None",
		maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
	});

	return token;
};
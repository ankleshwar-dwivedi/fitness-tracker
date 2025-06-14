// /backend/src/utils/generateToken.js
import jwt from "jsonwebtoken";
import config from "../config/index.js";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, config.jwtSecret, {
    // expiresIn: "30d", // Original
    expiresIn: "1d", // Changed to 1 day for better security. Adjust as needed.
                     // Consider "1h" or "12h" if you want it even shorter.
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: config.nodeEnv !== "development",
    sameSite: "strict",
    // maxAge should align with expiresIn. 1 day = 24 * 60 * 60 * 1000 ms
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });
};

export default generateToken;
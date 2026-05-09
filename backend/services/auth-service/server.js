require("dotenv").config();
const sendEmail = require("./utils/sendEmail");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const redis = new Redis(process.env.REDIS_URL);

const UserSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

app.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const registerLockKey = `otp-register-lock:${email}`;
    const isRegisterLocked = await redis.get(registerLockKey);

    if (isRegisterLocked) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting OTP again",
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const expiresIn = 300;

    const pendingUser = {
      userName,
      email,
      password: hashed,
    };

    await redis.set(
      `pending:${email}`,
      JSON.stringify(pendingUser),
      "EX",
      expiresIn
    );

    await redis.set(`otp:${email}`, otp, "EX", expiresIn);
    await redis.set(registerLockKey, "1", "EX", 30);

    res.json({
      success: true,
      message: "OTP sent to email",
      otpExpiresAt: Date.now() + expiresIn * 1000,
    });

    sendEmail(email, "Verify your HireFlow account", otp).catch(() => {});
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (storedOtp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const pendingUser = await redis.get(`pending:${email}`);

    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: "No pending user",
      });
    }

    await User.create(JSON.parse(pendingUser));

    await redis.del(`otp:${email}`);
    await redis.del(`pending:${email}`);

    res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const pendingUser = await redis.get(`pending:${email}`);

    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: "No pending registration found",
      });
    }

    const resendLockKey = `otp-resend-lock:${email}`;
    const isLocked = await redis.get(resendLockKey);

    if (isLocked) {
      return res.status(429).json({
        success: false,
        message: "Please wait before resending OTP",
      });
    }

    const limitKey = `otp-resend-count:${email}`;
    let count = await redis.get(limitKey);
    count = count ? parseInt(count) : 0;

    if (count >= 3) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Try again later.",
      });
    }

    await redis.set(limitKey, count + 1, "EX", 600);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresIn = 300;

    await redis.set(`otp:${email}`, otp, "EX", expiresIn);
    await redis.set(resendLockKey, "1", "EX", 30);

    sendEmail(email, "Your new verification code", otp).catch(() => {});

    res.json({
      success: true,
      message: "OTP resent successfully",
      otpExpiresAt: Date.now() + expiresIn * 1000,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Wrong password",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  await redis.set(`token:${user._id}`, token, "EX", 86400);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
});

app.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  await redis.del(`token:${decoded.id}`);

  res.json({ success: true });
});

app.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  res.json({ success: true, user });
});

app.listen(5001, () => {
  console.log("Auth service running on 5001");
});
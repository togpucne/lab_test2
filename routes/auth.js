const express = require("express");
const User = require("../models/User");
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // check username tồn tại chưa
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // tạo user mới (password sẽ được hash trong model)
    const user = new User({ username, password });
    await user.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "User registration failed", details: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // tìm user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // so sánh mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    res.cookie("sid", req.sessionID, {
      httpOnly: true,
      secure: false, // đổi thành true nếu chạy HTTPS
      maxAge: 1000 * 60 * 60 * 0.5, // 30 phút (1800000 ms)
    });

    // lưu session
    req.session.userId = user._id;
    res.json({ message: "Login successful!" });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    // Nếu bạn có set thêm cookie "sid", thì clear luôn
    res.clearCookie('sid');
    res.clearCookie("connect.sid"); // xoá cookie session
    res.json({ message: "Logout successful!" });
  });
});

// PROTECTED ROUTE (PROFILE)
router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findById(req.session.userId).select("-password");
  res.json(user);
});

module.exports = router;

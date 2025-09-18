const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // bạn bị thiếu dấu "="
const authRoutes = require('./routes/auth'); // bạn bị thiếu "="
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/sessionAuth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Session setup
app.use(
  session({
    secret: "mysecretkey", // thiếu dấu "
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/sessionAuth", // thiếu {}
    }),
    cookie: {
      httpOnly: true, // ngăn client-side JS đọc cookie
      secure: false,  // đổi thành true nếu dùng HTTPS
      maxAge: 1000 * 60 * 60 // 1 giờ
    }
  })
);


// Routes
app.use('/auth', authRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

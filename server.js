// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

// --- CORS Setup ---
// Only allow requests from your frontend URLs
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://peakcodestudiobackend.netlify.app", // replace with your actual deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight requests

// --- Body parser ---
app.use(express.json());

// --- Test route ---
app.get("/test", (req, res) => {
  res.send("Backend is live");
});

// --- Contact route ---
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // use app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TARGET_EMAIL,
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      text: `${email} - ${message}`,
    });

    console.log("Email sent!");
    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// --- Logging function ---
function logError(errorDetails) {
  const logFile = path.join(__dirname, "error.log");
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${errorDetails}\n`;
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
}

// --- CORS Setup ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://peakcodestudiov2.netlify.app",
  "https://peakcodestudio.com",
  "peakcodestudio.com",
  "www.peakcodestudio.com"

];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const message = `Blocked CORS request from origin: ${origin}`;
      logError(message); // log blocked CORS
      callback(new Error(message));
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
    const msg = `Validation failed: missing fields - ${JSON.stringify(
      req.body
    )}`;
    logError(msg);
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
    const msg = `Email error: ${error.message} | Data: ${JSON.stringify(
      req.body
    )}`;
    logError(msg);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

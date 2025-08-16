const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password here
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.TARGET_EMAIL,
      subject: `New contact form submission from ${name}`,
      text: `${email} - ${message}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

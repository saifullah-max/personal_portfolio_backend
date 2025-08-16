const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://peakcodestudiov2.netlify.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.get("/test", async (req, res) => {
  res.send("backend is live");
});

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
      from: process.env.EMAIL_USER, // your Gmail
      to: process.env.TARGET_EMAIL, // where you want to receive
      replyTo: email, // so reply goes to the user
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

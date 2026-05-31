"use strict";
// ============================================================
// Email Service
// Handles sending OTP emails via Nodemailer
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.sendOtpEmail = sendOtpEmail;
exports.sendPasswordResetOtpEmail = sendPasswordResetOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Generate a random 6-digit OTP
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
/**
 * Get the email transporter based on configured provider
 */
function getTransporter() {
    if (env_1.env.EMAIL_HOST && env_1.env.EMAIL_USER && env_1.env.EMAIL_PASS) {
        // SMTP configuration (Gmail, SendGrid, etc.)
        return nodemailer_1.default.createTransport({
            host: env_1.env.EMAIL_HOST,
            port: env_1.env.EMAIL_PORT,
            secure: env_1.env.EMAIL_PORT === 465,
            auth: {
                user: env_1.env.EMAIL_USER,
                pass: env_1.env.EMAIL_PASS,
            },
        });
    }
    // Fallback: Use Gmail with App Password
    if (env_1.env.GMAIL_USER && env_1.env.GMAIL_APP_PASSWORD) {
        return nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: env_1.env.GMAIL_USER,
                pass: env_1.env.GMAIL_APP_PASSWORD,
            },
        });
    }
    // No email configured - log OTP in console for development
    logger_1.logger.warn("No email configuration found. OTP will be logged to console only.");
    return null;
}
/**
 * Send an OTP email for email verification
 */
async function sendOtpEmail(email, otp) {
    const transporter = getTransporter();
    if (!transporter) {
        // In development, just log the OTP
        logger_1.logger.info(`[DEV] OTP for ${email}: ${otp}`);
        return;
    }
    const mailOptions = {
        from: `"TenderChain" <${env_1.env.EMAIL_USER || env_1.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your email - TenderChain OTP",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; }
          .header h1 { color: #e2b94b; margin: 0; font-size: 24px; }
          .header p { color: #a0a0b0; margin: 5px 0 0; font-size: 14px; }
          .content { padding: 30px; text-align: center; }
          .otp-box { background: #f8f9fa; border: 2px dashed #e2b94b; border-radius: 12px; padding: 20px; margin: 20px 0; display: inline-block; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; font-family: 'Courier New', monospace; }
          .info { color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
          .footer a { color: #e2b94b; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 TenderChain</h1>
            <p>Blockchain-Based Transparent E-Procurement System</p>
          </div>
          <div class="content">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 10px;">Email Verification</h2>
            <p class="info">Use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 10 minutes.</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="info">If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Decentralized TenderChain - Ministry of Electronics & IT, Government of India</p>
            <p><a href="${env_1.env.FRONTEND_URL}">${env_1.env.FRONTEND_URL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.logger.info(`OTP email sent to ${email}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to send OTP email to ${email}`, { error });
        // In development, still log the OTP
        logger_1.logger.info(`[DEV FALLBACK] OTP for ${email}: ${otp}`);
    }
}
/**
 * Send a password reset OTP email
 */
async function sendPasswordResetOtpEmail(email, otp) {
    const transporter = getTransporter();
    if (!transporter) {
        logger_1.logger.info(`[DEV] Password reset OTP for ${email}: ${otp}`);
        return;
    }
    const mailOptions = {
        from: `"TenderChain" <${env_1.env.EMAIL_USER || env_1.env.GMAIL_USER}>`,
        to: email,
        subject: "Password Reset - TenderChain OTP",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; }
          .header h1 { color: #e2b94b; margin: 0; font-size: 24px; }
          .content { padding: 30px; text-align: center; }
          .otp-box { background: #f8f9fa; border: 2px dashed #e2b94b; border-radius: 12px; padding: 20px; margin: 20px 0; display: inline-block; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; font-family: 'Courier New', monospace; }
          .info { color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
          .footer a { color: #e2b94b; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 TenderChain</h1>
            <p>Blockchain-Based Transparent E-Procurement System</p>
          </div>
          <div class="content">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 10px;">Password Reset Request</h2>
            <p class="info">Use the following OTP to reset your password. This OTP is valid for 10 minutes.</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="info">If you did not request a password reset, please ignore this email and contact support.</p>
          </div>
          <div class="footer">
            <p>Decentralized TenderChain - Ministry of Electronics & IT, Government of India</p>
            <p><a href="${env_1.env.FRONTEND_URL}">${env_1.env.FRONTEND_URL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Password reset OTP email sent to ${email}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to send password reset OTP to ${email}`, { error });
        logger_1.logger.info(`[DEV FALLBACK] Password reset OTP for ${email}: ${otp}`);
    }
}
//# sourceMappingURL=email.service.js.map
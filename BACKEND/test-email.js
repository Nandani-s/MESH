import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

import("./utils/sendEmail.js").then(async ({ default: sendEmail }) => {
  const result = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "MESH Test",
    html: "<h1>It works! 🎉</h1>",
  });
  console.log("Result:", result);
  process.exit(0);
});
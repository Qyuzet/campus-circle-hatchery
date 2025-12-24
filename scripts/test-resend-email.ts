import { config } from "dotenv";
import { Resend } from "resend";

config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendEmail() {
  console.log("Testing Resend Email Configuration...\n");

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const testEmail = process.env.TEST_EMAIL || "delivered@resend.dev";

  console.log(`From Email: ${fromEmail}`);
  console.log(`To Email: ${testEmail}`);
  console.log(`API Key: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
  console.log(`Environment: ${process.env.NODE_ENV}\n`);

  try {
    console.log("Sending test email...");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: "CampusCircle - Test Email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e40af; margin-top: 0;">Test Email Successful!</h2>
              <p>This is a test email from CampusCircle.</p>
              <p>If you received this email, your Resend configuration is working correctly.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Sent at: ${new Date().toISOString()}
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("\nError sending email:");
      console.error(JSON.stringify(error, null, 2));
      
      if (error.message?.includes("domain")) {
        console.log("\nDomain Verification Required:");
        console.log("1. Go to https://resend.com/domains");
        console.log("2. Add your domain: campuscircle.id");
        console.log("3. Add the DNS records to your domain registrar");
        console.log("4. Wait for verification (15-30 minutes)");
        console.log("\nOr use the test domain temporarily:");
        console.log('RESEND_FROM_EMAIL="CampusCircle <onboarding@resend.dev>"');
      }
      
      process.exit(1);
    }

    console.log("\nEmail sent successfully!");
    console.log("Email ID:", data?.id);
    console.log("\nCheck your inbox at:", testEmail);
    console.log("\nYou can also view the email in Resend dashboard:");
    console.log("https://resend.com/emails");

    process.exit(0);
  } catch (error) {
    console.error("\nUnexpected error:");
    console.error(error);
    process.exit(1);
  }
}

testResendEmail();


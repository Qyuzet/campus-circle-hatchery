import { config } from "dotenv";

config({ path: ".env.local" });

async function testCronJob() {
  console.log("Testing Cron Job Endpoint...\n");

  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = "http://localhost:3000";
  const endpoint = `${baseUrl}/api/cron/notify-unread-messages`;

  console.log(`Endpoint: ${endpoint}`);
  console.log(`Cron Secret: ${cronSecret?.substring(0, 10)}...\n`);

  try {
    console.log("Calling cron job endpoint...");

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const data = await response.json();

    console.log(`\nResponse Status: ${response.status}`);
    console.log("Response Data:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\nCron job executed successfully!");
      console.log(`Total unread messages found: ${data.totalUnreadMessages}`);
      console.log(`Emails sent: ${data.emailsSent}`);
    } else {
      console.error("\nCron job failed!");
      console.error("Error:", data.error);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error("\nError calling cron job:");
    console.error(error);
    process.exit(1);
  }
}

testCronJob();

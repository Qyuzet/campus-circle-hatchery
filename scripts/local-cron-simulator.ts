import { config } from "dotenv";

config({ path: ".env.local" });

const CRON_INTERVAL = 60 * 1000; // 1 minute in milliseconds

async function callCronEndpoint() {
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = "http://localhost:3000";
  const endpoint = `${baseUrl}/api/cron/notify-unread-messages`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const data = await response.json();
    const timestamp = new Date().toLocaleTimeString();

    if (response.ok) {
      console.log(`[${timestamp}] ✓ Cron executed - Emails sent: ${data.emailsSent}`);
    } else {
      console.error(`[${timestamp}] ✗ Cron failed:`, data.error);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] ✗ Error calling cron:`, error instanceof Error ? error.message : error);
  }
}

console.log("Local Cron Simulator Started");
console.log("Running cron job every 60 seconds...");
console.log("Press Ctrl+C to stop\n");

// Run immediately on start
callCronEndpoint();

// Then run every minute
setInterval(callCronEndpoint, CRON_INTERVAL);


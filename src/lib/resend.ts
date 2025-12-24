import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Use onboarding@resend.dev for development/testing
    // Change to your verified domain in production
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "CampusCircle <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully to:", to);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export function getUnreadMessageEmailTemplate(
  userName: string,
  senderName: string,
  messageContent: string,
  conversationUrl: string
) {
  return `
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
          <h2 style="color: #1e40af; margin-top: 0;">You have an unread message</h2>
          <p>Hi ${userName},</p>
          <p><strong>${senderName}</strong> sent you a message:</p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #555;">${messageContent}</p>
          </div>
          <p>
            <a href="${conversationUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Message</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle. You received this email because you have unread messages.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getNewListingEmailTemplate(
  userName: string,
  listingType: string,
  listingTitle: string,
  listingPrice: number,
  listingUrl: string
) {
  return `
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
          <h2 style="color: #1e40af; margin-top: 0;">Your listing is now live!</h2>
          <p>Hi ${userName},</p>
          <p>Your ${listingType} listing has been successfully created:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">${listingTitle}</h3>
            <p style="font-size: 18px; font-weight: bold; color: #059669; margin: 10px 0;">Rp ${listingPrice.toLocaleString()}</p>
          </div>
          <p>
            <a href="${listingUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Listing</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getPurchaseNotificationEmailTemplate(
  sellerName: string,
  itemTitle: string,
  itemType: string,
  amount: number,
  buyerName: string,
  ordersUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #059669; margin-top: 0;">You made a sale!</h2>
          <p>Hi ${sellerName},</p>
          <p>Great news! <strong>${buyerName}</strong> just purchased your ${itemType}:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">${itemTitle}</h3>
            <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 10px 0;">Rp ${amount.toLocaleString()}</p>
          </div>
          <p>The payment has been confirmed and your earnings will be available for withdrawal after the 3-day holding period.</p>
          <p>
            <a href="${ordersUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Details</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getClubJoinRequestEmailTemplate(
  adminName: string,
  userName: string,
  userStudentId: string,
  userFaculty: string,
  userMajor: string,
  clubName: string,
  manageUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e40af; margin-top: 0;">New Club Join Request</h2>
          <p>Hi ${adminName},</p>
          <p>A student has requested to join <strong>${clubName}</strong>:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Student ID:</strong> ${userStudentId}</p>
            <p style="margin: 5px 0;"><strong>Faculty:</strong> ${userFaculty}</p>
            <p style="margin: 5px 0;"><strong>Major:</strong> ${userMajor}</p>
          </div>
          <p>Please review and approve or reject this request.</p>
          <p>
            <a href="${manageUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Requests</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getClubRequestApprovedEmailTemplate(
  userName: string,
  clubName: string,
  joinUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #059669; margin-top: 0;">Request Approved!</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your request to join <strong>${clubName}</strong> has been approved.</p>
          <p>You can now click the button below to complete your membership.</p>
          <p>
            <a href="${joinUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Club Now</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getClubRequestRejectedEmailTemplate(
  userName: string,
  clubName: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">Request Not Approved</h2>
          <p>Hi ${userName},</p>
          <p>Unfortunately, your request to join <strong>${clubName}</strong> was not approved at this time.</p>
          <p>You may contact the club organizers for more information or try again later.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getClubJoinedEmailTemplate(
  userName: string,
  clubName: string,
  clubsUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CampusCircle</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #059669; margin-top: 0;">Welcome to ${clubName}!</h2>
          <p>Hi ${userName},</p>
          <p>You have successfully joined <strong>${clubName}</strong>.</p>
          <p>You can now access club activities, events, and connect with other members.</p>
          <p>
            <a href="${clubsUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View My Clubs</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from CampusCircle.
          </p>
        </div>
      </body>
    </html>
  `;
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { subject, message, category, relatedItemId, relatedItemType } = body;

    if (!subject || !message || !category) {
      return NextResponse.json(
        { error: "Subject, message, and category are required" },
        { status: 400 }
      );
    }

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true, name: true },
    });

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "No admin users found" },
        { status: 500 }
      );
    }

    const adminEmails = admins.map((admin) => admin.email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .label { font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
            .value { color: #4b5563; margin-bottom: 15px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .badge-technical { background: #dbeafe; color: #1e40af; }
            .badge-payment { background: #fef3c7; color: #92400e; }
            .badge-account { background: #d1fae5; color: #065f46; }
            .badge-content { background: #e0e7ff; color: #3730a3; }
            .badge-other { background: #f3f4f6; color: #374151; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Support Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">CampusCircle Support System</p>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">Category</div>
                <div class="value">
                  <span class="badge badge-${category.toLowerCase()}">${category.toUpperCase()}</span>
                </div>
                
                <div class="label">Subject</div>
                <div class="value">${subject}</div>
                
                <div class="label">From</div>
                <div class="value">
                  ${user.name || "Unknown User"}<br>
                  ${user.email}<br>
                  Student ID: ${user.studentId || "N/A"}
                </div>
                
                ${
                  relatedItemType && relatedItemId
                    ? `
                <div class="label">Related Item</div>
                <div class="value">
                  Type: ${relatedItemType}<br>
                  ID: ${relatedItemId}
                </div>
                `
                    : ""
                }
              </div>
              
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
              
              <div class="footer">
                <p>This is an automated message from CampusCircle Support System.</p>
                <p>Please respond to ${user.email} to assist the user.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "CampusCircle Support <noreply@campuscircle.com>",
      to: adminEmails,
      subject: `[Support] ${category.toUpperCase()}: ${subject}`,
      html: emailHtml,
      replyTo: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Support request sent successfully",
    });
  } catch (error: any) {
    console.error("Support contact error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send support request" },
      { status: 500 }
    );
  }
}


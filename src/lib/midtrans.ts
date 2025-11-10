// Midtrans Payment Gateway Configuration
import midtransClient from "midtrans-client";

// Initialize Snap API client
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// Initialize Core API client (for transaction status, etc.)
export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// Transaction parameter types
export interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

export interface MidtransTransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details: MidtransItemDetail[];
  customer_details: MidtransCustomerDetails;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
}

/**
 * Create a payment transaction and get Snap token
 */
export async function createTransaction(params: MidtransTransactionParams) {
  try {
    const transaction = await snap.createTransaction(params);
    return {
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error: any) {
    console.error("Midtrans create transaction error:", error);
    return {
      success: false,
      error: error.message || "Failed to create transaction",
    };
  }
}

/**
 * Check transaction status
 */
export async function getTransactionStatus(orderId: string) {
  try {
    const status = await coreApi.transaction.status(orderId);
    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    console.error("Midtrans get status error:", error);
    return {
      success: false,
      error: error.message || "Failed to get transaction status",
    };
  }
}

/**
 * Cancel a transaction
 */
export async function cancelTransaction(orderId: string) {
  try {
    const result = await coreApi.transaction.cancel(orderId);
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Midtrans cancel transaction error:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel transaction",
    };
  }
}

/**
 * Generate unique order ID
 */
export function generateOrderId(prefix: string = "ORDER") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Verify notification signature from Midtrans
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to our app status
 */
export function mapTransactionStatus(midtransStatus: string): string {
  const statusMap: Record<string, string> = {
    capture: "COMPLETED",
    settlement: "COMPLETED",
    pending: "PENDING",
    deny: "FAILED",
    cancel: "CANCELLED",
    expire: "EXPIRED",
    failure: "FAILED",
  };
  return statusMap[midtransStatus] || "PENDING";
}


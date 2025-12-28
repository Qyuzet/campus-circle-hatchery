export const paymentAPI = {
  async syncPendingPayments() {
    try {
      const response = await fetch("/api/payments/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sync payments");
      }

      return await response.json();
    } catch (error) {
      console.error("Payment sync error:", error);
      throw error;
    }
  },
};


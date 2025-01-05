import { Receipt } from "lucide-react";

export const PaymentHistory = () => {
  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Payment History</h2>
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Receipt className="h-12 w-12 mb-4" />
        <p>No payment history available</p>
      </div>
    </div>
  );
};
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PhoneNumber } from "./types";

interface PhoneNumberListProps {
  numbers: PhoneNumber[];
  onSelect: (number: PhoneNumber) => void;
  onPurchase: (number: PhoneNumber) => Promise<void>;
  isPurchasing: boolean;
}

export function PhoneNumberList({ numbers, onSelect, onPurchase, isPurchasing }: PhoneNumberListProps) {
  if (numbers.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No phone numbers found. Try adjusting your search criteria.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {numbers.map((number) => (
        <Card
          key={number.phoneNumber}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect(number)}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{number.friendlyName}</p>
              <p className="text-sm text-muted-foreground">
                Capabilities: {number.capabilities.join(", ")}
              </p>
            </div>
            <p className="text-sm font-medium">
              ${number.monthlyCost}/month
            </p>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={(e) => {
              e.stopPropagation();
              onPurchase(number);
            }}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Purchase"
            )}
          </Button>
        </Card>
      ))}
    </div>
  );
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: string[];
  monthlyCost: number;
}

interface PhoneNumberDetailsProps {
  number: PhoneNumber;
  onClose: () => void;
}

export const PhoneNumberDetails = ({ number, onClose }: PhoneNumberDetailsProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phone Number Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Phone Number</h4>
            <p>{number.friendlyName}</p>
          </div>
          <div>
            <h4 className="font-medium">Capabilities</h4>
            <p>{number.capabilities.join(", ")}</p>
          </div>
          <div>
            <h4 className="font-medium">Monthly Cost</h4>
            <p>${number.monthlyCost}/month</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
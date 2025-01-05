import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubscribeButton from "@/components/SubscribeButton";

interface SubscriptionDialogProps {
  isOpen: boolean;
}

const SubscriptionDialog = ({ isOpen }: SubscriptionDialogProps) => {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Subscribe to Access SMS Campaigns
          </DialogTitle>
          <DialogDescription className="text-center">
            To access the SMS campaign features, you need an active subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <SubscribeButton />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
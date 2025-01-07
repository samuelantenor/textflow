import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneNumberSearch } from "./PhoneNumberSearch";
import { Plus } from "lucide-react";

export const BuyPhoneNumberDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buy Phone Number
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Buy a New Phone Number</DialogTitle>
        </DialogHeader>
        <PhoneNumberSearch onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
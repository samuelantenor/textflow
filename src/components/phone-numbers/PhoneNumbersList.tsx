import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Phone } from "lucide-react";
import { BuyPhoneNumberForm } from "./BuyPhoneNumberForm";
import { RequestFreeNumberDialog } from "./RequestFreeNumberDialog";
import { usePhoneNumberPaymentSuccess } from "@/hooks/usePhoneNumberPaymentSuccess";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PhoneNumbersList() {
  const { t } = useTranslation("forms");
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [newNumber, setNewNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  usePhoneNumberPaymentSuccess();

  const { data: phoneNumbers, isLoading, refetch } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>{t("phoneNumbers.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("phoneNumbers.title")}</h2>
        <div className="space-x-2">
          <Dialog open={isAddingNumber} onOpenChange={setIsAddingNumber}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t("phoneNumbers.add.button")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("phoneNumbers.add.title")}</DialogTitle>
                <DialogDescription>{t("phoneNumbers.add.description")}</DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label>{t("phoneNumbers.add.label")}</Label>
                  <Input placeholder={t("phoneNumbers.add.placeholder")} />
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Phone className="w-4 h-4 mr-2" />
                {t("phoneNumbers.request.button")}
              </Button>
            </DialogTrigger>
            <RequestFreeNumberDialog onClose={() => setRequestDialogOpen(false)} />
          </Dialog>

          <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Phone className="w-4 h-4 mr-2" />
                {t("phoneNumbers.buy.button")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("phoneNumbers.buy.title")}</DialogTitle>
                <DialogDescription>{t("phoneNumbers.buy.description")}</DialogDescription>
              </DialogHeader>
              <BuyPhoneNumberForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

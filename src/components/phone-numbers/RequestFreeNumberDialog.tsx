import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export const RequestFreeNumberDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation("forms");
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!country) {
      toast({
        variant: "destructive",
        description: t("phoneNumbers.request.errors.selectCountry"),
      });
      return;
    }

    try {
      setIsLoading(true);
      toast({
        description: t("phoneNumbers.request.success"),
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("phoneNumbers.request.error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("phoneNumbers.request.title")}</DialogTitle>
        <DialogDescription>{t("phoneNumbers.request.description")}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>{t("phoneNumbers.request.region")}</Label>
          <PhoneInput
            country={"us"}
            enableSearch
            disableSearchIcon
            inputProps={{
              required: true,
            }}
            onChange={(value) => setCountry(value)}
            containerClass="!w-full"
            inputClass="!w-full !h-10 !text-base !text-black"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("phoneNumbers.common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("phoneNumbers.request.processing")}
              </>
            ) : (
              t("phoneNumbers.request.submit")
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};


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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.email) throw new Error('User email not found');

      // Save request to phone_number_requests table
      const { error: requestError } = await supabase
        .from('phone_number_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          region: country,
          status: 'free_request'
        });

      if (requestError) throw requestError;

      // Update subscription to mark free number as requested
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ has_requested_free_number: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subscriptionError) throw subscriptionError;

      // Send notification via Formspree
      await fetch("https://formspree.io/f/mnnnowqq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          region: country,
          message: `Free phone number request:\nEmail: ${user.email}\nRegion: ${country}`,
          type: "free_number_request"
        }),
      });

      toast({
        description: t("phoneNumbers.request.success"),
      });
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
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
        <DialogDescription>
          {t("phoneNumbers.request.description")}
        </DialogDescription>
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
            buttonClass="!h-10"
            searchClass="!w-full !text-black"
            dropdownClass="!text-black"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            {t("phoneNumbers.common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
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

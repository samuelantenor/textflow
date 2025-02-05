
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShareFormDialogProps {
  form: {
    id: string;
    title: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareFormDialog({ form, open, onOpenChange }: ShareFormDialogProps) {
  const { t, i18n } = useTranslation("forms");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formUrl = form ? `${window.location.origin}/${i18n.language}/forms/${form.id}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast({
        title: t("share.copied.title"),
        description: t("share.copied.description"),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t("share.error"),
        description: t("share.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.title")}{form ? `: ${form.title}` : ''}</DialogTitle>
          <DialogDescription>
            {t("share.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={formUrl}
              className="w-full"
            />
          </div>
          <Button
            size="icon"
            onClick={handleCopy}
            className="px-3"
            disabled={!form}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

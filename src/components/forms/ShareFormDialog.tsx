import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomForm } from "./types";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareFormDialogProps {
  form: CustomForm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareFormDialog({ form, open, onOpenChange }: ShareFormDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!form) return null;

  const formUrl = `${window.location.origin}/forms/${form.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast({
        title: "Success",
        description: "Form URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Share this link with your contacts to collect their information
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={formUrl} readOnly />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className={copied ? "text-green-500" : ""}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
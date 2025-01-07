import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface ShareFormDialogProps {
  form: {
    id: string;
    title: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareFormDialog({ form, open, onOpenChange }: ShareFormDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!form) return null;

  const formUrl = `${window.location.origin}/forms/${form.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Form URL has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form: {form.title}</DialogTitle>
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
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Share this link with others to allow them to fill out your form.
        </p>
      </DialogContent>
    </Dialog>
  );
}
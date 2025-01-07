import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function BuyPhoneNumberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("https://formspree.io/f/mnnnowqq", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Request sent successfully",
          description: "We'll get back to you shortly with your phone number details.",
        });
        e.currentTarget.reset();
      } else {
        throw new Error("Failed to send request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            name="company"
            type="text"
            required
            placeholder="Your Company Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_type">Phone Number Type</Label>
          <Input
            id="phone_type"
            name="phone_type"
            type="text"
            required
            placeholder="e.g., Toll-Free, Local"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Additional Requirements</Label>
          <Textarea
            id="requirements"
            name="requirements"
            placeholder="Please specify any additional requirements (area code preferences, features needed, etc.)"
            className="min-h-[100px]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending Request..." : "Request Phone Number"}
        </Button>
      </form>
    </Card>
  );
}
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

export function PhoneNumbersList() {
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from('phone_numbers').insert({
        user_id: session.user.id,
        phone_number: newNumber,
        twilio_sid: 'private', // This is now a placeholder as SID is managed privately
        monthly_cost: 0, // This would typically come from Twilio
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: "Phone number added",
        description: "Your phone number has been added successfully.",
      });

      setIsAddingNumber(false);
      setNewNumber("");
      refetch();
    } catch (error) {
      console.error("Error adding phone number:", error);
      toast({
        title: "Error",
        description: "Failed to add phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading phone numbers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Phone Numbers</h2>
        <div className="space-x-2">
          <Dialog open={isAddingNumber} onOpenChange={setIsAddingNumber}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Phone Number</DialogTitle>
                <DialogDescription>
                  Add a phone number you've received from Twilio to use for sending messages.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddNumber} className="space-y-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    placeholder="+1234567890"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingNumber(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Number
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Phone className="w-4 h-4 mr-2" />
                Buy New Number
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request a New Phone Number</DialogTitle>
                <DialogDescription>
                  Fill out this form to request a new phone number. We'll get back to you with the details.
                </DialogDescription>
              </DialogHeader>
              <BuyPhoneNumberForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {phoneNumbers?.map((number) => (
          <div
            key={number.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{number.phone_number}</p>
                <p className="text-sm text-muted-foreground">
                  Added on {new Date(number.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        ))}

        {phoneNumbers?.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">No phone numbers added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
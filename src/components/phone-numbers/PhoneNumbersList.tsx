
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

  // Add subscription query to check if user has requested free number
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

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

      // First check if this number already exists for the user
      const { data: existingNumbers } = await supabase
        .from('phone_numbers')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('phone_number', newNumber)
        .single();

      if (existingNumbers) {
        toast({
          variant: "destructive",
          description: t("phoneNumbers.add.alreadyExists")
        });
        return;
      }

      // If no existing number found, proceed with insertion
      const { error } = await supabase.from('phone_numbers').insert({
        user_id: session.user.id,
        phone_number: newNumber,
        twilio_sid: 'private',
        monthly_cost: 0,
        status: 'active',
      });

      if (error) throw error;

      toast({
        description: t("phoneNumbers.add.success")
      });

      setIsAddingNumber(false);
      setNewNumber("");
      refetch();
    } catch (error) {
      console.error("Error adding phone number:", error);
      toast({
        variant: "destructive",
        description: t("phoneNumbers.add.error")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePhoneNumber = async (id: string, newNumber: string) => {
    const { error } = await supabase
      .from('phone_numbers')
      .update({ phone_number: newNumber })
      .eq('id', id);

    if (error) throw error;
  };

  const deletePhoneNumber = async (id: string) => {
    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const handleEditNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumber) return;

    setIsSubmitting(true);
    try {
      await updatePhoneNumber(selectedNumber.id, newNumber);
      toast({
        description: t("phoneNumbers.edit.success")
      });
      setIsEditingNumber(false);
      setSelectedNumber(null);
      setNewNumber("");
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("phoneNumbers.edit.error")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNumber) return;

    try {
      await deletePhoneNumber(selectedNumber.id);
      toast({
        description: t("phoneNumbers.delete.success")
      });
      setDeleteDialogOpen(false);
      setSelectedNumber(null);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("phoneNumbers.delete.error")
      });
    }
  };

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
                <DialogDescription>
                  {t("phoneNumbers.add.description")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddNumber} className="space-y-4">
                <div>
                  <Label htmlFor="phone_number">{t("phoneNumbers.add.label")}</Label>
                  <Input
                    id="phone_number"
                    placeholder={t("phoneNumbers.add.placeholder")}
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
                    {t("phoneNumbers.common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("phoneNumbers.add.button")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary"
                disabled={subscription?.has_requested_free_number}
              >
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("phoneNumbers.buy.title")}</DialogTitle>
                <DialogDescription>
                  {t("phoneNumbers.buy.description")}
                </DialogDescription>
              </DialogHeader>
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
                  {t("phoneNumbers.common.addedOn", { 
                    date: new Date(number.created_at).toLocaleDateString() 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedNumber(number);
                  setNewNumber(number.phone_number);
                  setIsEditingNumber(true);
                }}
              >
                {t("phoneNumbers.edit.button")}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setSelectedNumber(number);
                  setDeleteDialogOpen(true);
                }}
              >
                {t("phoneNumbers.delete.button")}
              </Button>
            </div>
          </div>
        ))}

        {phoneNumbers?.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">{t("phoneNumbers.common.noNumbers")}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditingNumber} onOpenChange={setIsEditingNumber}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("phoneNumbers.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("phoneNumbers.edit.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditNumber} className="space-y-4">
            <div>
              <Label htmlFor="edit_phone_number">{t("phoneNumbers.add.label")}</Label>
              <Input
                id="edit_phone_number"
                placeholder={t("phoneNumbers.add.placeholder")}
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditingNumber(false);
                  setSelectedNumber(null);
                  setNewNumber("");
                }}
              >
                {t("phoneNumbers.common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("phoneNumbers.edit.saveButton")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("phoneNumbers.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("phoneNumbers.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedNumber(null);
            }}>
              {t("phoneNumbers.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("phoneNumbers.delete.confirmButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

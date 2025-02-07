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
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function PhoneNumbersList() {
  const { t } = useTranslation("phoneNumbers");
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
          description: t("add.alreadyExists")
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
        description: t("add.success")
      });

      setIsAddingNumber(false);
      setNewNumber("");
      refetch();
    } catch (error) {
      console.error("Error adding phone number:", error);
      toast({
        variant: "destructive",
        description: t("add.error")
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
        description: t("edit.success")
      });
      setIsEditingNumber(false);
      setSelectedNumber(null);
      setNewNumber("");
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("edit.error")
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
        description: t("delete.success")
      });
      setDeleteDialogOpen(false);
      setSelectedNumber(null);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("delete.error")
      });
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);

    if (error) {
      toast({
        title: t("delete.title"),
        description: t("delete.error"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("delete.title"),
        description: t("delete.success"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="space-x-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!phoneNumbers?.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <div className="space-x-2">
            <Dialog open={isAddingNumber} onOpenChange={setIsAddingNumber}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("add.button")}
                </Button>
              </DialogTrigger>
              {/* ... rest of add dialog content ... */}
            </Dialog>

            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary"
                  disabled={subscription?.has_requested_free_number}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t("request.button")}
                </Button>
              </DialogTrigger>
              <RequestFreeNumberDialog onClose={() => setRequestDialogOpen(false)} />
            </Dialog>
          </div>
        </div>
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("empty.title")}</h3>
            <p className="text-muted-foreground">
              {t("empty.description")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("title")} ({phoneNumbers.length})</h2>
        <div className="space-x-2">
          <Dialog open={isAddingNumber} onOpenChange={setIsAddingNumber}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t("add.button")}
              </Button>
            </DialogTrigger>
            {/* ... rest of add dialog content ... */}
          </Dialog>

          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary"
                disabled={subscription?.has_requested_free_number}
              >
                <Phone className="w-4 h-4 mr-2" />
                {t("request.button")}
              </Button>
            </DialogTrigger>
            <RequestFreeNumberDialog onClose={() => setRequestDialogOpen(false)} />
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4">
        {phoneNumbers.map((number) => (
          <div
            key={number.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{number.phone_number}</p>
                <p className="text-sm text-muted-foreground">
                  {t("common.addedOn", { 
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
                {t("edit.button")}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setSelectedNumber(number);
                  setDeleteDialogOpen(true);
                }}
              >
                {t("delete.button")}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* ... Edit and Delete dialogs remain the same ... */}
    </div>
  );
}

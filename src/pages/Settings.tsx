import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

interface AccountSettingsForm {
  email: string;
  full_name: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<AccountSettingsForm>({
    defaultValues: {
      email: profile?.email || '',
      full_name: profile?.full_name || '',
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        email: profile.email,
        full_name: profile.full_name || '',
      });
    }
  }, [profile, form]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const onSubmit = async (data: AccountSettingsForm) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your account settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 bg-black/20">
            <h2 className="text-lg font-semibold mb-6">Account Settings</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">
                  Save Changes
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
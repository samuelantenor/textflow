
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input as InputOTP } from "@/components/ui/input";

interface AccountSettingsForm {
  email: string;
  full_name: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation(['settings']);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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
        navigate(`/${i18n.language}/login`);
      }
    };
    checkAuth();
  }, [navigate, i18n.language]);

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
        title: t('messages.updateSuccess.title'),
        description: t('messages.updateSuccess.description'),
      });
    } catch (error) {
      toast({
        title: t('messages.updateError.title'),
        description: t('messages.updateError.description'),
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
    // Update the URL to reflect the new language
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|fr)/, `/${newLanguage}`);
    navigate(newPath);
  };

  const handleShareCampaignPage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${i18n.language}/campaign-request/${session.user.id}`;
    setShareUrl(url);
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>{t('messages.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-card rounded-lg p-6 bg-black/20">
            <h2 className="text-lg font-semibold mb-6">{t('account.title')}</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('account.email')}</FormLabel>
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
                      <FormLabel>{t('account.fullName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">
                  {t('account.saveChanges')}
                </Button>
              </form>
            </Form>
          </div>

          {/* Campaign Request Page Settings */}
          <div className="bg-card rounded-lg p-6 bg-black/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{t('campaignRequest.title')}</h2>
              <Button
                onClick={handleShareCampaignPage}
                variant="outline"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t('campaignRequest.shareTitle')}
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              {t('campaignRequest.shareDescription')}
            </p>
          </div>

          {/* Language Settings */}
          <div className="bg-card rounded-lg p-6 bg-black/20">
            <h2 className="text-lg font-semibold mb-6">{t('language.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {t('language.select')}
                </label>
                <Select
                  value={i18n.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('language.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      {t('language.languages.en')}
                    </SelectItem>
                    <SelectItem value="fr">
                      {t('language.languages.fr')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('campaignRequest.shareTitle')}</DialogTitle>
            <DialogDescription>
              {t('campaignRequest.shareDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <InputOTP
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { CampaignFormFields } from "@/components/campaign/CampaignFormFields";
import type { CampaignFormData } from "@/types/campaign";
import { useTranslation } from "react-i18next";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>();
  const { t, i18n } = useTranslation(['campaigns']);

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error(t('errors.auth'));
      }

      const { error } = await supabase.from("campaigns").insert({
        user_id: session.user.id,
        name: data.name,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: t('success.created'),
        description: t('create.savedAsDraft'),
      });

      // Navigate immediately after successful creation
      navigate(`/${i18n.language}/dashboard?tab=campaigns`, { replace: true });

    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: t('errors.create'),
        description: error instanceof Error ? error.message : t('errors.create'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/${i18n.language}/dashboard?tab=campaigns`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('create.backToCampaigns')}
        </Button>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t('create.title')}</h1>
            <p className="text-muted-foreground">
              {t('create.subtitle')}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CampaignFormFields form={form} showAllFields={false} />
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/${i18n.language}/dashboard?tab=campaigns`)}
                >
                  {t('buttons.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('create.createCampaign')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;

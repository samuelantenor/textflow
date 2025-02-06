
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
}

const MAX_MESSAGE_LENGTH = 160;

const CampaignRequest = () => {
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(['campaigns']);
  const [messageLength, setMessageLength] = useState(0);
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: t('errors.create'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, toast, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('business_name', profile?.full_name || '');
      formData.append('business_email', profile?.email || '');
      
      if (date) {
        formData.set('preferred_date', format(date, 'PPP'));
      }
      
      const response = await fetch('https://formspree.io/f/mnnqpdwn', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: t('success.sent.title'),
          description: t('success.sent.description'),
        });
        (e.target as HTMLFormElement).reset();
        setDate(undefined);
        setMessageLength(0);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: t('errors.create'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('errors.create')}</CardTitle>
            <CardDescription>
              {t('errors.tryAgain')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('form.request.title', { businessName: profile.full_name })}</CardTitle>
          <CardDescription>
            {t('form.request.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                name="campaign_name"
                placeholder={t('form.name.placeholder')}
                required
                className="bg-background"
              />
            </div>
            <div>
              <div className="relative">
                <Textarea
                  name="campaign_message"
                  placeholder={t('form.message.placeholder')}
                  required
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="bg-background min-h-[100px]"
                  onChange={(e) => setMessageLength(e.target.value.length)}
                />
                <span className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {messageLength}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : t('form.schedule.placeholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Textarea
                name="additional_notes"
                placeholder={t('form.notes.placeholder')}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('buttons.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignRequest;

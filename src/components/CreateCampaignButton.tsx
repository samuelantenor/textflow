import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const CreateCampaignButton = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['campaigns']);

  return (
    <Button 
      className="bg-primary hover:bg-primary/90 text-white"
      onClick={() => navigate(`/${i18n.language}/campaigns/create`)}
    >
      <Plus className="w-4 h-4 mr-2" />
      {t('create.newCampaign')}
    </Button>
  );
};
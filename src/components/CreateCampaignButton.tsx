import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CreateCampaignButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      className="bg-primary hover:bg-primary/90 text-white"
      onClick={() => navigate("/campaigns/new")}
    >
      <Plus className="w-4 h-4 mr-2" />
      New Campaign
    </Button>
  );
};
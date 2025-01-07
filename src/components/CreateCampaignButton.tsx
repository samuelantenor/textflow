import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateCampaignButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      className="bg-success hover:bg-success/90 text-white"
      onClick={() => navigate("/campaign/new")}
    >
      <Plus className="w-4 h-4 mr-2" />
      New Campaign
    </Button>
  );
};

export default CreateCampaignButton;
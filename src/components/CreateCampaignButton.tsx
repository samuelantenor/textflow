import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateCampaignButton = () => {
  return (
    <Button className="bg-primary hover:bg-primary/90 text-white">
      <Plus className="w-4 h-4 mr-2" />
      New Campaign
    </Button>
  );
};

export default CreateCampaignButton;
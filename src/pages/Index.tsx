import CreateCampaignButton from "@/components/CreateCampaignButton";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";

const Index = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SMS Campaigns</h1>
          <CreateCampaignButton />
        </div>
        
        <StatsDisplay />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          <CampaignTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
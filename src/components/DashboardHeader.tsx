import CreateCampaignButton from "@/components/CreateCampaignButton";
import UserMenu from "@/components/UserMenu";

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">SMS Campaigns</h1>
      <div className="flex items-center gap-4">
        <CreateCampaignButton />
        <UserMenu onLogout={onLogout} />
      </div>
    </div>
  );
};

export default DashboardHeader;
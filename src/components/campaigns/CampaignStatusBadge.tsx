import { Badge } from "@/components/ui/badge";

interface CampaignStatusBadgeProps {
  status: 'draft' | 'sent';
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status}
    </Badge>
  );
}
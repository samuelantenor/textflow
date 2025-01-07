import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface CampaignScheduleBadgeProps {
  scheduledFor: string;
}

export function CampaignScheduleBadge({ scheduledFor }: CampaignScheduleBadgeProps) {
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {format(new Date(scheduledFor), "MMM d, yyyy")}
    </Badge>
  );
}
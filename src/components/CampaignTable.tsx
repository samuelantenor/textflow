import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const campaigns = [
  {
    id: 1,
    name: "Summer Sale 2024",
    status: "Active",
    recipients: 1234,
    sent: 1200,
    openRate: "95%",
  },
  {
    id: 2,
    name: "Welcome Flow",
    status: "Draft",
    recipients: 500,
    sent: 0,
    openRate: "-",
  },
  {
    id: 3,
    name: "Product Launch",
    status: "Scheduled",
    recipients: 2500,
    sent: 0,
    openRate: "-",
  },
];

const CampaignTable = () => {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Open Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    campaign.status === "Active"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted"
                  }
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{campaign.recipients}</TableCell>
              <TableCell>{campaign.sent}</TableCell>
              <TableCell>{campaign.openRate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignTable;
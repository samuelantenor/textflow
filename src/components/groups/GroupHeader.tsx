import { formatDate } from "@/utils/dateUtils";

interface GroupHeaderProps {
  name: string;
  contactCount: number;
  createdAt: string;
}

export const GroupHeader = ({ name, contactCount, createdAt }: GroupHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg truncate" title={name}>
        {name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {contactCount} contacts
      </p>
      <p className="text-xs text-muted-foreground">
        Created {formatDate(createdAt)}
      </p>
    </div>
  );
};
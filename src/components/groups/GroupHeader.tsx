import { formatDate } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";

interface GroupHeaderProps {
  name: string;
  contactCount: number;
  createdAt: string;
}

export const GroupHeader = ({ name, contactCount, createdAt }: GroupHeaderProps) => {
  const { t } = useTranslation(['groups']);

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg truncate" title={name}>
        {name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('contacts.count', { count: contactCount })}
      </p>
      <p className="text-xs text-muted-foreground">
        {t('created', { date: formatDate(createdAt) })}
      </p>
    </div>
  );
};
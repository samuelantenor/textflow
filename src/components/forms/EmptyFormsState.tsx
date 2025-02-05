import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EmptyFormsState = () => {
  const { t } = useTranslation("forms");

  return (
    <Card className="p-12 text-center space-y-4 col-span-full">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">{t("list.empty.title")}</h3>
        <p className="text-muted-foreground">
          {t("list.empty.description")}
        </p>
      </div>
    </Card>
  );
};
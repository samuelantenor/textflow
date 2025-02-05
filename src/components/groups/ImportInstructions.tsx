import { useTranslation } from "react-i18next";

export function ImportInstructions() {
  const { t } = useTranslation(['groups']);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        {t('contacts.import.instructions.title')}
      </p>
      <ul className="list-disc list-inside text-sm text-gray-500 ml-2">
        <li>{t('contacts.import.instructions.name')}</li>
        <li>{t('contacts.import.instructions.phone')}</li>
      </ul>
    </div>
  );
}
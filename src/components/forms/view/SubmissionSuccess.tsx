
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { FormResponse } from "@/types/form";

interface SubmissionSuccessProps {
  form: FormResponse;
  onSubmitAnother: () => void;
}

export function SubmissionSuccess({ form, onSubmitAnother }: SubmissionSuccessProps) {
  const { t } = useTranslation("forms");

  const backgroundStyle = {
    backgroundColor: form.background_color || '#000000',
    backgroundImage: form.background_image_url ? `url(${form.background_image_url})` : undefined,
    backgroundSize: form.background_image_style === 'repeat' ? 'auto' : form.background_image_style,
    backgroundRepeat: form.background_image_style === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: 'center',
    fontFamily: form.font_family || 'Inter',
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center py-12 px-4"
      style={backgroundStyle}
    >
      <Card className="w-full max-w-2xl mx-auto p-6 sm:p-8 text-center bg-black/80 backdrop-blur-sm border-gray-800/50">
        <h2 className="text-2xl font-bold mb-4" style={{ color: form.primary_color }}>
          {t("submission.success.title")}
        </h2>
        <p className="text-gray-300 mb-6">{t("submission.success.description")}</p>
        <button
          onClick={onSubmitAnother}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md"
          style={{
            backgroundColor: form.primary_color,
            color: '#ffffff',
          }}
        >
          {t("submission.success.submitAnother")}
        </button>
      </Card>
    </div>
  );
}

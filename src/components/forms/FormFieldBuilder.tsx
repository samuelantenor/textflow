import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FormFieldBuilderProps {
  form: UseFormReturn<any>;
}

export function FormFieldBuilder({ form }: FormFieldBuilderProps) {
  const { t } = useTranslation("forms");
  const [fieldType, setFieldType] = useState<string>('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState('');

  const addField = () => {
    if (!fieldLabel) return;

    const currentFields = form.getValues('fields') || [];
    const newField: any = {
      type: fieldType,
      label: fieldLabel,
      required: isRequired,
      description: fieldDescription || undefined,
      placeholder: placeholder || undefined,
    };

    if (['radio', 'select'].includes(fieldType) && options) {
      newField.options = options.split('\n').filter(Boolean);
    }

    form.setValue('fields', [...currentFields, newField]);

    // Reset form
    setFieldLabel('');
    setFieldDescription('');
    setPlaceholder('');
    setFieldType('text');
    setIsRequired(false);
    setOptions('');
  };

  return (
    <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
      <h3 className="font-semibold">{t("builder.fields.addNew")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("builder.fields.type")}</Label>
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger>
              <SelectValue placeholder={t("builder.fields.selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">{t("builder.fields.types.text")}</SelectItem>
              <SelectItem value="textarea">{t("builder.fields.types.textarea")}</SelectItem>
              <SelectItem value="email">{t("builder.fields.types.email")}</SelectItem>
              <SelectItem value="phone">{t("builder.fields.types.phone")}</SelectItem>
              <SelectItem value="number">{t("builder.fields.types.number")}</SelectItem>
              <SelectItem value="date">{t("builder.fields.types.date")}</SelectItem>
              <SelectItem value="checkbox">{t("builder.fields.types.checkbox")}</SelectItem>
              <SelectItem value="radio">{t("builder.fields.types.radio")}</SelectItem>
              <SelectItem value="select">{t("builder.fields.types.select")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("builder.fields.label")}</Label>
          <Input
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            placeholder={t("builder.fields.labelPlaceholder")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("builder.fields.description")}</Label>
        <Input
          value={fieldDescription}
          onChange={(e) => setFieldDescription(e.target.value)}
          placeholder={t("builder.fields.descriptionPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("builder.fields.placeholder")}</Label>
        <Input
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder={t("builder.fields.placeholderPlaceholder")}
        />
      </div>
      {['radio', 'select'].includes(fieldType) && (
        <div className="space-y-2">
          <Label>{t("builder.fields.options")}</Label>
          <Textarea
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder={t("builder.fields.optionsPlaceholder")}
            rows={4}
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          checked={isRequired}
          onCheckedChange={setIsRequired}
          id="required"
        />
        <Label htmlFor="required">{t("builder.fields.required")}</Label>
      </div>
      <Button
        type="button"
        onClick={addField}
        disabled={!fieldLabel}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("builder.fields.addButton")}
      </Button>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const templates = [
    { id: "template1", name: "Professional" },
    { id: "template2", name: "Modern" },
    { id: "template3", name: "Minimal" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {templates.map((template) => (
        <Button
          key={template.id}
          variant={value === template.id ? "default" : "outline"}
          className={cn(
            "h-20 flex flex-col items-center justify-center",
            value === template.id && "ring-2 ring-primary ring-offset-2"
          )}
          onClick={() => onChange(template.id)}
        >
          <span className="text-xs">{template.name}</span>
        </Button>
      ))}
    </div>
  );
}
interface FormHeaderProps {
  title: string;
  description?: string | null;
}

export function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
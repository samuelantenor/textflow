import { Card } from "@/components/ui/card";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message = "Form not found" }: FormErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-muted-foreground">{message}</p>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";

interface FormContainerProps {
  children: React.ReactNode;
  backgroundStyle: {
    backgroundColor: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
    fontFamily: string;
  };
}

export function FormContainer({ children, backgroundStyle }: FormContainerProps) {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center py-12 px-4"
      style={backgroundStyle}
    >
      <Card 
        className="w-full max-w-2xl mx-auto p-6 sm:p-8 relative overflow-hidden bg-black/80 backdrop-blur-sm border-gray-800/50"
      >
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </div>
  );
}

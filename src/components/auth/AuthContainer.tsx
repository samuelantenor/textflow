import React from 'react';

interface AuthContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  error?: string | null;
}

const AuthContainer = ({ title, description, children, error }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
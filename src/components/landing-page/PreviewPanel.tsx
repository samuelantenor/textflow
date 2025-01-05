interface PreviewPanelProps {
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  selectedFont: string;
  borderRadius: number;
  spacing: number;
  businessName: string;
  description: string;
  welcomeMessage: string;
}

export function PreviewPanel({
  template,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  textColor,
  selectedFont,
  borderRadius,
  spacing,
  businessName,
  description,
  welcomeMessage,
}: PreviewPanelProps) {
  const previewStyle = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
    '--accent-color': accentColor,
    '--background-color': backgroundColor,
    '--text-color': textColor,
    '--border-radius': `${borderRadius}px`,
    '--spacing': `${spacing}px`,
    fontFamily: selectedFont,
  } as React.CSSProperties;

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Preview</h2>
      <div 
        className="aspect-[9/16] bg-background rounded-lg border-2 border-dashed border-muted overflow-hidden"
        style={previewStyle}
      >
        <div className="w-full h-full p-4" style={{ backgroundColor: backgroundColor, color: textColor }}>
          <h1 style={{ color: primaryColor }} className="text-2xl font-bold mb-4">
            {businessName || "Your Business Name"}
          </h1>
          <p style={{ color: secondaryColor }} className="text-lg mb-6">
            {welcomeMessage || "Welcome Message"}
          </p>
          <p className="mb-8">
            {description || "Business Description"}
          </p>
          <button
            style={{
              backgroundColor: accentColor,
              borderRadius: `${borderRadius}px`,
              padding: `${spacing / 2}px ${spacing}px`,
            }}
            className="text-white hover:opacity-90 transition-opacity"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
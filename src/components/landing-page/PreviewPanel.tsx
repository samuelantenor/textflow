import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

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
        className="w-full bg-background rounded-lg border-2 border-dashed border-muted overflow-hidden"
        style={previewStyle}
      >
        <div className="w-full min-h-[600px]" style={{ backgroundColor, color: textColor }}>
          {/* Header */}
          <header className="p-6 border-b" style={{ borderColor: secondaryColor }}>
            <div className="max-w-5xl mx-auto">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: primaryColor }}
              >
                {businessName || "Your Business Name"}
              </h1>
              <p 
                className="text-xl"
                style={{ color: secondaryColor }}
              >
                {welcomeMessage || "Book Your Next Appointment Online"}
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-5xl mx-auto p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Business Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: primaryColor }}>
                    About Us
                  </h2>
                  <p className="text-lg leading-relaxed">
                    {description || "Share information about your business and services..."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: accentColor }} />
                    <span>123 Business Street, City, State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" style={{ color: accentColor }} />
                    <span>Mon-Fri: 9am-6pm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: accentColor }} />
                    <span>Online booking available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div>
                <div 
                  className="p-6 rounded-lg shadow-lg"
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <h3 
                    className="text-xl font-semibold mb-4"
                    style={{ color: primaryColor }}
                  >
                    Schedule an Appointment
                  </h3>
                  
                  <div className="space-y-4">
                    <Button
                      className="w-full text-white"
                      style={{
                        backgroundColor: accentColor,
                        borderRadius: `${borderRadius}px`,
                        padding: `${spacing/2}px ${spacing}px`,
                      }}
                    >
                      Book Now
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Choose your service and preferred time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
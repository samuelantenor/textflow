import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
];

export function BuyPhoneNumberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    region: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Check if the URL has a success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowThankYou(true);
      // Send form data to Formspree
      const savedFormData = localStorage.getItem('phoneNumberFormData');
      if (savedFormData) {
        const data = JSON.parse(savedFormData);
        submitToFormspree(data);
        localStorage.removeItem('phoneNumberFormData'); // Clean up stored data
      }
    }
  }, []);

  const submitToFormspree = async (data: typeof formData) => {
    try {
      await fetch('https://formspree.io/f/mnnnowqq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          company: data.company,
          region: data.region,
          message: `New phone number request:
            Email: ${data.email}
            Company: ${data.company}
            Region: ${data.region}`,
        }),
      });
    } catch (error) {
      console.error('Error sending form to Formspree:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeforePayment = () => {
    // Store form data in localStorage before redirecting to Stripe
    localStorage.setItem('phoneNumberFormData', JSON.stringify(formData));
  };

  if (showThankYou) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Thank you for your payment!</h3>
        <p className="text-muted-foreground">
          Your new phone number is on its way. We'll process your request and contact you shortly.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            name="company"
            type="text"
            required
            placeholder="Your Company Name"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select 
            name="region" 
            value={formData.region}
            onValueChange={(value) => handleInputChange('region', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-4 border-t">
          <div>
            <span className="text-lg font-semibold">$5.00/month</span>
            <p className="text-sm text-muted-foreground">
              Includes unlimited incoming messages
            </p>
          </div>
          <div onClick={handleBeforePayment}>
            <stripe-buy-button
              buy-button-id="buy_btn_1QeVcgB4RWKZ2dNza9CFKIwx"
              publishable-key="pk_test_51QL67PB4RWKZ2dNzsxovpn7D6fAiFm6cj7aH3TDwv1HmrQgAh4CJUpBZJdKqLWPj9uNHsj3j4IgLrynaKEqbp95n00KL67n19K"
            >
            </stripe-buy-button>
          </div>
        </div>
      </form>
    </Card>
  );
}
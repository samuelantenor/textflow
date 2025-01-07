import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const SubscribeButton = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <stripe-buy-button
      buy-button-id="buy_btn_1QeVcgB4RWKZ2dNza9CFKIwx"
      publishable-key="pk_test_51QL67PB4RWKZ2dNzsxovpn7D6fAiFm6cj7aH3TDwv1HmrQgAh4CJUpBZJdKqLWPj9uNHsj3j4IgLrynaKEqbp95n00KL67n19K"
    />
  );
};

export default SubscribeButton;
import { format, isValid, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import i18next from "i18next";

export const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Invalid date";
    }

    // Get current language
    const currentLanguage = i18next.language;
    
    // Format based on locale
    if (currentLanguage === 'fr') {
      return format(date, "d MMMM yyyy", { locale: fr });
    }
    
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
export interface ContactData {
  name: string | null;
  phone_number: string;
  group_id: string;
}

export const processCSVContacts = (text: string, groupId: string): ContactData[] => {
  const rows = text.split('\n');
  return rows
    .map((row) => {
      const [name, phone_number] = row.split(',').map((field) => field.trim());
      // Basic phone number validation
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phone_number || !phoneRegex.test(phone_number)) return null;
      return {
        group_id: groupId,
        name: name || null,
        phone_number: phone_number.replace(/[\s-()]/g, ''), // Normalize phone number
      };
    })
    .filter((contact): contact is ContactData => contact !== null);
};
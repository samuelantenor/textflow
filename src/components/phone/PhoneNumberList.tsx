import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BuyPhoneNumberDialog } from "./BuyPhoneNumberDialog";

export const PhoneNumberList = () => {
  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Phone Numbers</h2>
        <BuyPhoneNumberDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone Number</TableHead>
            <TableHead>Capabilities</TableHead>
            <TableHead>Monthly Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phoneNumbers?.map((number) => (
            <TableRow key={number.id}>
              <TableCell>{number.phone_number}</TableCell>
              <TableCell>
                {Array.isArray(number.capabilities)
                  ? number.capabilities.join(", ")
                  : "N/A"}
              </TableCell>
              <TableCell>${number.monthly_cost}/month</TableCell>
              <TableCell>{number.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
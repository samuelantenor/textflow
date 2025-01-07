import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Loader2 } from "lucide-react";

export interface SearchForm {
  areaCode: string;
  pattern: string;
  sms: boolean;
  voice: boolean;
}

interface PhoneNumberSearchFormProps {
  onSearch: (data: SearchForm) => Promise<void>;
  isSearching: boolean;
}

export function PhoneNumberSearchForm({ onSearch, isSearching }: PhoneNumberSearchFormProps) {
  const { register, handleSubmit } = useForm<SearchForm>({
    defaultValues: {
      sms: true,
      voice: true
    }
  });

  return (
    <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="areaCode">Area Code</Label>
          <Input
            id="areaCode"
            placeholder="e.g. 415"
            {...register("areaCode")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pattern">Number Pattern</Label>
          <Input
            id="pattern"
            placeholder="e.g. 555****"
            {...register("pattern")}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="sms" {...register("sms")} />
          <Label htmlFor="sms">SMS</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="voice" {...register("voice")} />
          <Label htmlFor="voice">Voice</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSearching}>
        {isSearching ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Phone className="mr-2 h-4 w-4" />
        )}
        Search Numbers
      </Button>
    </form>
  );
}
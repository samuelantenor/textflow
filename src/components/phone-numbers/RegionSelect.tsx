import { Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Region {
  value: string;
  label: string;
}

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  regions: Region[];
}

export function RegionSelect({ value, onChange, regions }: RegionSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegions = regions.filter((region) =>
    region.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>Select Region</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a region" />
        </SelectTrigger>
        <SelectContent className="h-[300px]">
          <div className="sticky top-0 p-2 bg-popover border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(300px-56px)]" type="always">
            <div className="p-2">
              {filteredRegions.map((region) => (
                <SelectItem 
                  key={region.value} 
                  value={region.value}
                  className="rounded-md cursor-pointer"
                >
                  {region.label}
                </SelectItem>
              ))}
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
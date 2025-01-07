import { Search } from "lucide-react";
import { useState, useRef } from "react";
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
  readonly value: string;
  readonly label: string;
}

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  regions: readonly Region[];
}

export function RegionSelect({ value, onChange, regions }: RegionSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredRegions = regions.filter((region) =>
    region.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset search when opening
      setSearchQuery("");
      // Wait for the content to be mounted before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Only show regions if there's a search query
  const regionsToShow = searchQuery.length > 0 ? filteredRegions : [];

  return (
    <div className="space-y-2">
      <Label className="text-black">Select Region</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger className="w-full text-black">
          <SelectValue placeholder="Search for a region" />
        </SelectTrigger>
        <SelectContent className="h-[300px]">
          <div className="sticky top-0 p-2 bg-popover border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Type to search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(300px-56px)]" type="always">
            <div className="p-2">
              {searchQuery.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Type to search for regions
                </p>
              ) : regionsToShow.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No regions found
                </p>
              ) : (
                regionsToShow.map((region) => (
                  <SelectItem 
                    key={region.value} 
                    value={region.value}
                    className="rounded-md cursor-pointer text-black"
                  >
                    {region.label}
                  </SelectItem>
                ))
              )}
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
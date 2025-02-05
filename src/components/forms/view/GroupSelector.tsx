import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Group {
  id: string;
  name: string;
}

interface GroupSelectorProps {
  groups: Group[];
  selectedGroup: string;
  onGroupSelect: (groupId: string) => void;
}

export function GroupSelector({ groups, selectedGroup, onGroupSelect }: GroupSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="group-select">Select Group</Label>
      <Select value={selectedGroup} onValueChange={onGroupSelect}>
        <SelectTrigger id="group-select">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
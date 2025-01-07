import { FormBuilder } from "./FormBuilder";

interface FormsHeaderProps {
  groupId?: string;
}

export const FormsHeader = ({ groupId }: FormsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Forms</h2>
      {groupId && <FormBuilder groupId={groupId} />}
    </div>
  );
};
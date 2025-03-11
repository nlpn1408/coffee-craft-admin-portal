import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface ActionColumnProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionColumn({ onEdit, onDelete }: ActionColumnProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
} 
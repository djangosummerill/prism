import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Zap, Target, X, LucideBrain } from "lucide-react";
import { cn } from "@/lib/utils";
import High from "./icons/high";
import Low from "./icons/low";

interface ReasoningSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  showNone?: boolean;
  className?: string;
}

export default function ReasoningSelector({
  value,
  onValueChange,
  showNone = false,
  className,
}: ReasoningSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-[140px]", className)}>
        <SelectValue placeholder="Reasoning" />
      </SelectTrigger>
      <SelectContent>
        {showNone && (
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>None</span>
            </div>
          </SelectItem>
        )}
        <SelectItem value="low">
          <div className="flex items-center gap-2">
            <Low />
            <span>Low</span>
          </div>
        </SelectItem>
        <SelectItem value="medium">
          <div className="flex items-center gap-2">
            <LucideBrain className="h-4 w-4" />
            <span>Medium</span>
          </div>
        </SelectItem>
        <SelectItem value="high">
          <div className="flex items-center gap-2">
            <High />
            <span>High</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

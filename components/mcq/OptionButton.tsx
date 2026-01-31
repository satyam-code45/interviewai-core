import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionButtonProps {
  option: string;
  optionIndex: number;
  isSelected: boolean;
  isCorrect: boolean;
  submitted: boolean;
  onClick: () => void;
}

const optionLabels = ["A", "B", "C", "D"];

export function OptionButton({
  option,
  optionIndex,
  isSelected,
  isCorrect,
  submitted,
  onClick,
}: OptionButtonProps) {
  const getVariantClasses = () => {
    if (!submitted) {
      return isSelected
        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }

    if (isCorrect) {
      return "border-success bg-success/10 ring-2 ring-success/20";
    }

    if (isSelected && !isCorrect) {
      return "border-destructive bg-destructive/10 ring-2 ring-destructive/20";
    }

    return "border-border opacity-60";
  };

  return (
    <button
      onClick={onClick}
      disabled={submitted}
      className={cn(
        "group relative flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        getVariantClasses(),
        !submitted && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
          !submitted && isSelected && "bg-primary text-primary-foreground",
          !submitted && !isSelected && "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          submitted && isCorrect && "bg-success text-success-foreground",
          submitted && isSelected && !isCorrect && "bg-destructive text-destructive-foreground",
          submitted && !isCorrect && !isSelected && "bg-muted text-muted-foreground"
        )}
      >
        {submitted && isCorrect ? (
          <Check className="w-4 h-4" />
        ) : submitted && isSelected && !isCorrect ? (
          <X className="w-4 h-4" />
        ) : (
          optionLabels[optionIndex]
        )}
      </span>
      <span className={cn(
        "flex-1 font-medium",
        submitted && isCorrect && "text-success",
        submitted && isSelected && !isCorrect && "text-destructive"
      )}>
        {option}
      </span>
    </button>
  );
}

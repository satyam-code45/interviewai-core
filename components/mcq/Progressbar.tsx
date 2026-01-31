interface ProgressBarProps {
  answered: number;
  total: number;
}

export function ProgressBar({ answered, total }: ProgressBarProps) {
  const percentage = (answered / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-muted-foreground">Progress</span>
        <span className="text-foreground">
          {answered} of {total} answered
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

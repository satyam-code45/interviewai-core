import { Trophy, Target, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ScoreCardProps {
  score: number;
  total: number;
  onRetry: () => void;
}

export function ScoreCard({ score, total, onRetry }: ScoreCardProps) {
  const percentage = Math.round((score / total) * 100);
  
  const getMessage = () => {
    if (percentage === 100) return { text: "Perfect Score!", emoji: "🎉" };
    if (percentage >= 80) return { text: "Excellent!", emoji: "🌟" };
    if (percentage >= 60) return { text: "Good Job!", emoji: "👍" };
    if (percentage >= 40) return { text: "Keep Practicing!", emoji: "💪" };
    return { text: "Don't Give Up!", emoji: "📚" };
  };

  const { text, emoji } = getMessage();

  return (
    <Card className="animate-scale-in border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
      <CardContent className="pt-8 pb-6 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-2">
          <Trophy className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            {text} {emoji}
          </h2>
          <p className="text-muted-foreground">
            You've completed the assessment
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl font-bold text-success">{percentage}%</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <Target className="w-4 h-4" />
          <span>Review your answers below</span>
        </div>

        <Button
          onClick={onRetry}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Test
        </Button>
      </CardContent>
    </Card>
  );
}

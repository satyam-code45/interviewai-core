
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OptionButton } from "./OptionButton";
import type { MCQQuestion } from "./question";
import { Badge } from "../ui/badge";

interface QuestionCardProps {
  question: MCQQuestion;
  index: number;
  selectedAnswer?: string;
  submitted: boolean;
  onSelect: (option: string) => void;
}

export function QuestionCard({
  question,
  index,
  selectedAnswer,
  submitted,
  onSelect,
}: QuestionCardProps) {
  return (
    <Card className="animate-slide-up overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
              {index + 1}
            </span>
            <Badge variant="secondary" className="font-medium">
              {question.category}
            </Badge>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {question.topic}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold leading-relaxed text-foreground">
          {question.question}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, optIndex) => (
            <OptionButton
              key={opt}
              option={opt}
              optionIndex={optIndex}
              isSelected={selectedAnswer === opt}
              isCorrect={opt === question.correct_answer}
              submitted={submitted}
              onClick={() => onSelect(opt)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

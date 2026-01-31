"use client"
import { useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MCQ_QUESTIONS } from "./question";
import { ProgressBar } from "./Progressbar";
import { ScoreCard } from "./Scorecard";
import { QuestionCard } from "./Questioncard";
 

type AnswerMap = {
  [questionId: number]: string;
};

export function McqTest() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qid: number, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const score = MCQ_QUESTIONS.reduce((acc, q) => {
    if (answers[q.id] === q.correct_answer) acc++;
    return acc;
  }, 0);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === MCQ_QUESTIONS.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Web Development Assessment
                </h1>
                <p className="text-sm text-muted-foreground">
                  {MCQ_QUESTIONS.length} questions • ~10 minutes
                </p>
              </div>
            </div>
            {!submitted && (
              <Button
                onClick={() => setSubmitted(true)}
                disabled={!allAnswered}
                size="lg"
                className="gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                Submit
              </Button>
            )}
          </div>
          {!submitted && (
            <ProgressBar answered={answeredCount} total={MCQ_QUESTIONS.length} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
        {submitted && (
          <ScoreCard
            score={score}
            total={MCQ_QUESTIONS.length}
            onRetry={handleRetry}
          />
        )}

        <div className="space-y-6">
          {MCQ_QUESTIONS.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              selectedAnswer={answers[q.id]}
              submitted={submitted}
              onSelect={(option) => handleSelect(q.id, option)}
            />
          ))}
        </div>

        {!submitted && (
          <div className="flex justify-center pt-4 pb-8">
            <Button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              size="lg"
              className="gap-2 px-8 shadow-lg"
            >
              <Send className="w-4 h-4" />
              Submit Test
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

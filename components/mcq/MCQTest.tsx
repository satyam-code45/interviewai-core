"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Timer,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MCQ_QUESTIONS, MCQQuestion } from "./question";
import { Card } from "@/components/ui/card";

type AnswerMap = {
  [questionId: number]: string;
};

type TestState = "topic-selection" | "test" | "result";

// Get unique categories/topics
const TOPICS = Array.from(new Set(MCQ_QUESTIONS.map((q) => q.category)));

export function McqTest() {
  const [testState, setTestState] = useState<TestState>("topic-selection");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Timer logic
  useEffect(() => {
    if (testState !== "test" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestState("result");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const startTest = () => {
    if (selectedTopics.length === 0) return;

    const filteredQuestions = MCQ_QUESTIONS.filter((q) =>
      selectedTopics.includes(q.category),
    );
    // Shuffle questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);

    // Set timer: 1 minute per question
    const time = shuffled.length * 60;
    setTimeLeft(time);
    setTotalTime(time);
    setTestState("test");
  };

  const handleSelect = (qid: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const toggleFlag = (qid: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qid)) {
        newSet.delete(qid);
      } else {
        newSet.add(qid);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const handleSubmit = () => {
    setTestState("result");
  };

  const handleRetry = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentIndex(0);
    setTestState("topic-selection");
    setSelectedTopics([]);
  };

  const currentQuestion = questions[currentIndex];
  const score = questions.reduce((acc, q) => {
    if (answers[q.id] === q.correct_answer) acc++;
    return acc;
  }, 0);

  // Topic Selection Screen
  if (testState === "topic-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Online Assessment</h1>
            <p className="text-muted-foreground">
              Select topics to begin your practice test
            </p>
          </div>

          {/* Topic Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {TOPICS.map((topic) => {
              const count = MCQ_QUESTIONS.filter(
                (q) => q.category === topic,
              ).length;
              const isSelected = selectedTopics.includes(topic);

              return (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-semibold text-sm ${isSelected ? "text-primary" : ""}`}
                      >
                        {topic}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {count} questions
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selection Summary */}
          {selectedTopics.length > 0 && (
            <Card className="p-4 mb-6 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {
                        MCQ_QUESTIONS.filter((q) =>
                          selectedTopics.includes(q.category),
                        ).length
                      }{" "}
                      Questions Selected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Time:{" "}
                      {
                        MCQ_QUESTIONS.filter((q) =>
                          selectedTopics.includes(q.category),
                        ).length
                      }{" "}
                      minutes
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Start Button */}
          <div className="flex justify-center">
            <Button
              onClick={startTest}
              disabled={selectedTopics.length === 0}
              size="lg"
              className="px-12 py-6 text-lg gap-3"
            >
              <ClipboardList className="w-5 h-5" />
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Test Screen
  if (testState === "test" && currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with Timer */}
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-primary" />
                <span className="font-semibold">Online Assessment</span>
              </div>

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
                  timeLeft < 60
                    ? "bg-red-500/10 text-red-500"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>

              <Button
                onClick={handleSubmit}
                variant="default"
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Test
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Question Navigation Sidebar */}
          <aside className="w-64 bg-card border-r p-4 hidden md:block">
            <h3 className="font-semibold mb-3 text-sm">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? "bg-primary text-white"
                        : isAnswered
                          ? "bg-green-500/20 text-green-600 border border-green-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <Flag className="w-3 h-3 absolute -top-1 -right-1 text-orange-500 fill-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-muted-foreground">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-muted-foreground">
                  Flagged for Review
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Answered</span>
                <span className="font-medium">
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Flagged</span>
                <span className="font-medium">{flaggedQuestions.size}</span>
              </div>
            </div>
          </aside>

          {/* Main Question Area */}
          <main className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-sm">
                    {currentQuestion.category}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={
                    flaggedQuestions.has(currentQuestion.id)
                      ? "text-orange-500 border-orange-500"
                      : ""
                  }
                >
                  <Flag
                    className={`w-4 h-4 mr-2 ${flaggedQuestions.has(currentQuestion.id) ? "fill-orange-500" : ""}`}
                  />
                  {flaggedQuestions.has(currentQuestion.id)
                    ? "Flagged"
                    : "Flag"}
                </Button>
              </div>

              {/* Question */}
              <Card className="p-6 mb-6">
                <p className="text-lg font-medium leading-relaxed">
                  {currentQuestion.question}
                </p>
              </Card>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  const labels = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(currentQuestion.id, option)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${
                          isSelected ? "bg-primary text-white" : "bg-muted"
                        }`}
                      >
                        {labels[idx]}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Mobile Question Navigator */}
                <div className="md:hidden flex items-center gap-1">
                  {questions
                    .slice(
                      Math.max(0, currentIndex - 2),
                      Math.min(questions.length, currentIndex + 3),
                    )
                    .map((q, idx) => {
                      const actualIdx = Math.max(0, currentIndex - 2) + idx;
                      const isAnswered = answers[q.id] !== undefined;
                      const isCurrent = actualIdx === currentIndex;

                      return (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(actualIdx)}
                          className={`w-8 h-8 rounded text-xs font-medium ${
                            isCurrent
                              ? "bg-primary text-white"
                              : isAnswered
                                ? "bg-green-500/20 text-green-600"
                                : "bg-muted"
                          }`}
                        >
                          {actualIdx + 1}
                        </button>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Result Screen
  const percentage = Math.round((score / questions.length) * 100);
  const isPassed = percentage >= 70;
  const isAverage = percentage >= 40 && percentage < 70;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Main Container with yellow border */}
        <div className="rounded-3xl border-2 border-yellow-600/30 bg-card overflow-hidden">
          
          {/* Header Section with gradient */}
          <div className="relative bg-gradient-to-r from-yellow-600/10 via-yellow-600/5 to-transparent p-6 md:p-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col items-center text-center relative">
              {/* Success Icon with animation */}
              <div className={`relative mb-4 ${isPassed ? 'animate-bounce' : ''}`}>
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                    isPassed
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      : isAverage
                        ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-br from-red-500 to-red-600"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle className="w-11 h-11 text-white" />
                  ) : isAverage ? (
                    <AlertCircle className="w-11 h-11 text-white" />
                  ) : (
                    <XCircle className="w-11 h-11 text-white" />
                  )}
                </div>
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 rounded-full blur-xl ${
                    isPassed
                      ? "bg-emerald-500/30"
                      : isAverage
                        ? "bg-yellow-500/30"
                        : "bg-red-500/30"
                  }`}
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Assessment Complete!
              </h1>
              
              <p className="text-base text-muted-foreground mb-6">
                {isPassed
                  ? "🎉 Outstanding Performance!"
                  : isAverage
                    ? "Good effort! Keep practicing"
                    : "Don't give up! Try again"}
              </p>

              {/* Score Cards Grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
                {/* Correct */}
                <div className="bg-background rounded-2xl border-2 border-border p-4 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-4xl font-bold text-emerald-500">
                      {score}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Correct
                    </div>
                  </div>
                </div>

                {/* Wrong */}
                <div className="bg-background rounded-2xl border-2 border-border p-4 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-1">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-4xl font-bold text-red-500">
                      {questions.length - score}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wrong
                    </div>
                  </div>
                </div>

                {/* Percentage Score */}
                <div className="bg-background rounded-2xl border-2 border-border p-4 hover:border-yellow-600/50 transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-yellow-600/10 flex items-center justify-center mb-1">
                      <Flag className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-4xl font-bold text-yellow-600">
                      {percentage}%
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Score
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6 bg-background/50">
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <div className="text-2xl font-bold">{formatTime(totalTime - timeLeft)}</div>
              <div className="text-xs text-muted-foreground mt-1">Time Taken</div>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <div className="text-2xl font-bold">{selectedTopics.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Topics</div>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <div className={`text-2xl font-bold ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPassed ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Result</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 md:p-6 border-t border-border">
            <Button 
              onClick={handleRetry} 
              size="lg"
              className="rounded-xl px-8 gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <ClipboardList className="w-5 h-5" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
              className="rounded-xl px-8 border-2"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Questions Review Section */}
        <div className="mt-6 rounded-3xl border-2 border-yellow-600/30 bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600/10 via-yellow-600/5 to-transparent p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Review Your Answers</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed breakdown of all questions
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-600/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <div
                  key={q.id}
                  className={`bg-background rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isCorrect 
                      ? "border-emerald-500/30 hover:border-emerald-500/50" 
                      : "border-red-500/30 hover:border-red-500/50"
                  }`}
                >
                  {/* Question Header */}
                  <div className={`p-4 flex items-center justify-between ${
                    isCorrect ? "bg-emerald-500/5" : "bg-red-500/5"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                        isCorrect 
                          ? "bg-emerald-500/20 text-emerald-700" 
                          : "bg-red-500/20 text-red-700"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-background border border-border">
                          {q.category}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
                      isCorrect
                        ? "bg-emerald-500/20 text-emerald-700"
                        : "bg-red-500/20 text-red-700"
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Wrong</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="p-6">
                    <p className="font-semibold text-lg mb-4 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt) => {
                        const isUserAnswer = userAnswer === opt;
                        const isCorrectAnswer = q.correct_answer === opt;

                        return (
                          <div
                            key={opt}
                            className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              isCorrectAnswer
                                ? "bg-emerald-500/10 text-emerald-700 border-2 border-emerald-500/50 shadow-sm"
                                : isUserAnswer
                                  ? "bg-red-500/10 text-red-700 border-2 border-red-500/50"
                                  : "bg-muted/50 text-muted-foreground border-2 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isCorrectAnswer && (
                                <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <div className="h-6 w-6 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                                  <XCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <span className="flex-1">{opt}</span>
                            </div>
                            {isCorrectAnswer && (
                              <div className="absolute top-2 right-2 text-xs font-bold text-emerald-600">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
          
  );
}

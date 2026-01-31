"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Flag,
} from "lucide-react";

type Section = {
  title: string;
  content: string[];
};

function parseSummary(summary: string): Record<string, Section> {
  const lines = summary.split("\n").map(l => l.trim());
  const sections: Record<string, Section> = {};

  let current: Section | null = null;

  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith("**")) {
      const title = line.replace(/\*\*/g, "");
      current = { title, content: [] };
      sections[title] = current;
    } else if (line.startsWith("- ")) {
      current?.content.push(line.replace("- ", ""));
    } else if (line && current) {
      current.content.push(line);
    }
  }

  return sections;
}

export default function SummaryBox({ summary }: { summary: string }) {
  const sections = parseSummary(summary);

  return (
    <div className="h-[60vh] overflow-auto space-y-3 px-7">

      {/* Header */}
      

      {/* Topic */}
      {sections["Topic"] && (
        <Card className="border-none ">
          <CardContent className="px-5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <Badge>Topic</Badge>
            </div>
            <p className="text-lg font-medium">
              {sections["Topic"].content[0]}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conversation Overview */}
      {sections["Conversation Overview"] && (
        <Card className=" border-none bg-gray-50">
          <CardContent className="px-5 ">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Conversation Overview</h3>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              {sections["Conversation Overview"].content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {sections["Candidate Strengths"] && (
        <Card className="bg-green-100 border-none">
          <CardContent className="px-5">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-lg text-green-700">
                Candidate Strengths
              </h3>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              {sections["Candidate Strengths"].content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {sections["Areas for Improvement"] && (
        <Card className="bg-yellow-100 border-none">
          <CardContent className="px-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-lg text-yellow-700">
                Areas for Improvement
              </h3>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              {sections["Areas for Improvement"].content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Final Verdict */}
      {sections["Final Verdict"] && (
        <Card className="bg-blue-50 border-none">
          <CardContent className="px-6">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Final Verdict</h3>
            </div>
            <Separator className="" />
            <p className="text-sm leading-relaxed">
              {sections["Final Verdict"].content.join(" ")}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

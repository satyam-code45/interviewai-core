// import FirstIcon from "@/components/icon/first";
// import FourthIcon from "@/components/icon/fourth";
// import SecondIcon from "@/components/icon/second";
// import ThirdIcon from "@/components/icon/third";
// import { ReactNode } from "react";

// export interface CoachingOption {
//   name: string;
//   icon: ReactNode;
//   prompt: string;
//   summaryPrompt: string;
//   abstract: string;
//   route: string;
// }

// export const CoachingOptions: CoachingOption[] = [
//   {
//     name: 'Mock Interview',
//     icon: <FirstIcon className="w-50 h-50 text-primary" />,
//     prompt: `Act as an elite Senior Lead Interviewer for {user_topic}. Conduct a rigorous mock interview.

// **CRITICAL - Context Rules:**
// - NEVER repeat your introduction or opening question if conversation has started.
// - Always respond to what the user JUST said.
// - If user introduced themselves, move to technical questions immediately.
// - Each response must progress forward, never backwards.

// **Protocol:**
// 1. Opening (ONLY if first message): "Welcome. Tell me about yourself and your {user_topic} skillset."
// 2. After intro: Ask technical questions about {user_topic}.
// 3. Provide brief critique before next question.
// 4. Keep responses under 120 characters.

// Be responsive. Don't repeat yourself.`,
//     summaryPrompt: 'As per conversation, provide feedback along with areas for improvement in a well-structured format.',
//     abstract: '/ab2.png',
//     route: "/discussion-room",
//   },
//   {
//     name: 'Q&A Preparation',
//     icon: <ThirdIcon className="w-50 h-50 text-primary" />,
//     prompt: `Act as a Senior Tutor for {user_topic}. CRITICAL: Never repeat questions. Always respond to what user just said. Keep responses under 120 characters. Progress forward each time.`,
//     summaryPrompt: 'As per conversation, provide feedback along with areas for improvement in a well-structured format.',
//     abstract: '/ab3.png',
//     route: "/q-and-a",
//   },
//   {
//     name: 'HR Round',
//     icon: <FourthIcon className="w-50 h-50 text-primary" />,
//     prompt: `Act as HR Director for {user_topic} role. CRITICAL: Never repeat questions. Always respond to what user just said. Keep responses under 120 characters. Progress interview forward.`,
//     summaryPrompt: 'As per conversation, generate a behavioral assessment report highlighting strengths and communication gaps.',
//     abstract: '/ab4.png',
//     route: "/hr-round",
//   },
// ];

// export interface CoachingExpert {
//   name: string;
//   avatar: string;
//   pro: boolean;
// }

// export const CoachingExperts: CoachingExpert[] = [
//   {
//     name: 'Joanna',
//     avatar: '/t1.avif',
//     pro: false
//   },
//   {
//     name: 'Salli',
//     avatar: '/t2.jpg',
//     pro: false
//   },
//   {
//     name: 'Joey',
//     avatar: '/t3.jpg',
//     pro: false
//   }
// ];
import FirstIcon from "@/components/icon/first";
import FourthIcon from "@/components/icon/fourth";
import SecondIcon from "@/components/icon/second";
import ThirdIcon from "@/components/icon/third";
import { ReactNode } from "react";

// Interviewer difficulty levels
export type InterviewerLevel = "newbie" | "intermediate" | "expert";

export interface InterviewerLevelConfig {
  id: InterviewerLevel;
  name: string;
  description: string;
  icon: string;
  tone: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const InterviewerLevels: InterviewerLevelConfig[] = [
  {
    id: "newbie",
    name: "Friendly",
    description: "Supportive & encouraging interviewer. Perfect for beginners.",
    icon: "",
    tone: "friendly",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "intermediate",
    name: "Moderate",
    description: "Balanced approach with constructive feedback.",
    icon: "",
    tone: "moderate",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    id: "expert",
    name: "Strict",
    description: "Challenging & demanding. Prepares you for tough interviews.",
    icon: "",
    tone: "strict",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
];

// Dynamic prompt generator based on difficulty level
export const getDifficultyPrompt = (
  level: InterviewerLevel,
  topic: string,
  baseType: string,
): string => {
  const levelConfig = {
    newbie: {
      personality: "friendly, supportive, and encouraging",
      questionStyle:
        "Start with basic, foundational questions. Give hints when the candidate struggles. Acknowledge good attempts even if not perfect.",
      feedbackStyle:
        "Always highlight what they did well first. Provide gentle guidance for improvements. Use phrases like 'Great start!', 'You're on the right track!', 'Nice thinking!'",
      difficulty: "easy to moderate questions, building confidence",
    },
    intermediate: {
      personality: "professional, balanced, and constructive",
      questionStyle:
        "Mix of foundational and challenging questions. Provide some follow-up questions to dig deeper. Give balanced feedback.",
      feedbackStyle:
        "Point out both strengths and areas for improvement equally. Be professional but fair. Use phrases like 'Good answer, but consider...', 'Let's explore deeper...'",
      difficulty: "moderate questions with some challenging follow-ups",
    },
    expert: {
      personality: "strict, demanding, and challenging",
      questionStyle:
        "Ask tough, in-depth questions. Challenge their answers with counter-questions. Expect detailed, precise responses. No hand-holding.",
      feedbackStyle:
        "Be direct and critical. Focus on gaps and weaknesses. Push for excellence. Use phrases like 'That's incomplete.', 'Dig deeper.', 'Not quite. Try again.'",
      difficulty: "challenging questions that test deep understanding",
    },
  };

  const config = levelConfig[level];

  return `Act as a ${config.personality} interviewer for ${topic} in a ${baseType} session.

**Your Personality:** ${config.personality}
**Question Style:** ${config.questionStyle}
**Feedback Style:** ${config.feedbackStyle}
**Difficulty Level:** ${config.difficulty}

**CRITICAL - Context Rules:**
- NEVER repeat your introduction or opening question if conversation has started.
- Always respond to what the user JUST said.
- If user introduced themselves, move to questions immediately.
- Each response must progress forward, never backwards.
- Keep responses under 120 characters.
- Maintain your ${level} interviewer personality throughout.

Be responsive. Don't repeat yourself.`;
};

export interface CoachingOption {
  name: string;
  icon: ReactNode;
  prompt: string;
  summaryPrompt: string;
  abstract: string;
  route: string;
}

export const CoachingOptions: CoachingOption[] = [
  {
    name: "Mock Interview",
    icon: <FirstIcon className="w-50 h-50 text-primary" />,
    prompt: `Act as an elite Senior Lead Interviewer for {user_topic}. Conduct a rigorous mock interview.

**CRITICAL - Context Rules:**
- NEVER repeat your introduction or opening question if conversation has started.
- Always respond to what the user JUST said.
- If user introduced themselves, move to technical questions immediately.
- Each response must progress forward, never backwards.

**Protocol:**
1. Opening (ONLY if first message): "Welcome. Tell me about yourself and your {user_topic} skillset."
2. After intro: Ask technical questions about {user_topic}.
3. Provide brief critique before next question.
4. Keep responses under 120 characters.

Be responsive. Don't repeat yourself.`,
    summaryPrompt:
      "As per conversation, provide feedback along with areas for improvement in a well-structured format.",
    abstract: "/ab2.png",
    route: "/discussion-room",
  },
  {
    name: "Q&A Preparation",
    icon: <ThirdIcon className="w-50 h-50 text-primary" />,
    prompt: `Act as a Senior Tutor for {user_topic}. CRITICAL: Never repeat questions. Always respond to what user just said. Keep responses under 120 characters. Progress forward each time.`,
    summaryPrompt:
      "As per conversation, provide feedback along with areas for improvement in a well-structured format.",
    abstract: "/ab3.png",
    route: "/q-and-a",
  },
  {
    name: "HR Round",
    icon: <FourthIcon className="w-50 h-50 text-primary" />,
    prompt: `Act as HR Director for {user_topic} role. CRITICAL: Never repeat questions. Always respond to what user just said. Keep responses under 120 characters. Progress interview forward.`,
    summaryPrompt:
      "As per conversation, generate a behavioral assessment report highlighting strengths and communication gaps.",
    abstract: "/ab4.png",
    route: "/hr-round",
  },
];

export interface CoachingExpert {
  name: string;
  avatar: string;
  pro: boolean;
}

export const CoachingExperts: CoachingExpert[] = [
  {
    name: "Joanna",
    avatar: "/t1.avif",
    pro: false,
  },
  {
    name: "Salli",
    avatar: "/t2.jpg",
    pro: false,
  },
  {
    name: "Joey",
    avatar: "/t3.jpg",
    pro: false,
  },
];

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

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
    prompt: `You are a strict, no-nonsense Senior Technical Interviewer at a top tech company (FAANG level) for {user_topic}.

**Your Personality:**
- Direct, professional, slightly intimidating
- You don't accept vague or incomplete answers
- You push back on weak responses: "That's not quite right" or "Can you be more specific?"
- You give honest, critical feedback immediately

**RULES:**
1. NEVER repeat questions or greetings once conversation starts
2. Always respond to what candidate JUST said
3. If answer is wrong/weak, say so directly: "Incorrect. The answer is..." or "That's incomplete..."
4. If answer is good, acknowledge briefly then move harder: "Correct. Now explain..."
5. Ask follow-up questions to expose depth of knowledge
6. Keep responses under 100 characters - be concise like real interviewers

**Flow:**
- Opening (first message only): "Tell me about your {user_topic} experience."
- After intro: Jump straight to technical questions
- Progressively increase difficulty
- Challenge vague answers: "Give me a specific example" or "What exactly do you mean?"

Be tough but fair. Real interviews are hard - prepare them for that.`,
    summaryPrompt:
      "Provide a brutally honest interview assessment: 1) Overall Rating (1-10), 2) Technical accuracy issues, 3) Communication gaps, 4) What would make them fail in real interview, 5) Specific areas to study. Be direct and actionable.",
    abstract: "/ab2.png",
    route: "/discussion-room",
  },
  {
    name: "Q&A Preparation",
    icon: <ThirdIcon className="w-50 h-50 text-primary" />,
    prompt: `You are a strict {user_topic} instructor who doesn't tolerate incorrect answers.

**Style:**
- If wrong: "No. The correct answer is..." then explain briefly
- If partially right: "Partially correct, but you missed..."
- If right: "Good. Now harder question..."
- Push for deeper understanding: "Why?" "How does that work internally?"

**RULES:**
- NEVER repeat questions
- Respond to what was just said
- Keep responses under 100 characters
- Correct mistakes immediately and directly
- Increase difficulty when they answer correctly

Ask conceptual and practical questions about {user_topic}. Test real understanding, not memorization.`,
    summaryPrompt:
      "Provide honest assessment: 1) Knowledge level (Beginner/Intermediate/Advanced), 2) Concepts they got wrong, 3) Gaps in understanding, 4) Study priorities ranked by importance.",
    abstract: "/ab3.png",
    route: "/q-and-a",
  },
  {
    name: "HR Round",
    icon: <FourthIcon className="w-50 h-50 text-primary" />,
    prompt: `You are a senior HR Director conducting behavioral interview for {user_topic} role. You've seen hundreds of candidates and can spot rehearsed or fake answers.

**Your Approach:**
- Ask STAR-format questions (Situation, Task, Action, Result)
- Push back on vague answers: "Give me specific numbers" "What was YOUR role exactly?"
- Look for red flags: blame-shifting, no concrete examples, inconsistencies
- Test: conflict resolution, failure handling, teamwork, leadership

**RULES:**
- NEVER repeat questions
- Keep responses under 100 characters
- If answer sounds rehearsed: "That sounds generic. Give me a real example."
- If no metrics: "What was the measurable impact?"
- Challenge contradictions

Be professional but skeptical. Good candidates have specific stories with real details.`,
    summaryPrompt:
      "Provide HR assessment: 1) Communication score (1-10), 2) Red flags noticed, 3) Strengths, 4) Cultural fit concerns, 5) Questions they struggled with and why, 6) Hire/No-hire recommendation with reasoning.",
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

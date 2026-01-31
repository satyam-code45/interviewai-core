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
}

export const CoachingOptions: CoachingOption[] = [
  {
    name: 'Mock Interview',
    icon: <FirstIcon className="w-50 h-50 text-primary" />,
    prompt: 'You are a friendly AI voice interviewer simulating real interview scenarios for {user_topic}. Keep responses clear and concise. Ask structured, industry-relevant questions and provide constructive feedback to help users improve. Ensure responses stay under 120 characters.',
    summaryPrompt: 'As per conversation, provide feedback along with areas for improvement in a well-structured format.',
    abstract: '/ab2.png'
  },
  {
    name: 'Q&A Preparation',
   icon: <SecondIcon className="w-50 h-50 text-primary" />,
    prompt: 'You are a conversational AI voice tutor helping users practice Q&A for {user_topic}. Ask clear, well-structured questions and provide concise feedback. Encourage users to think critically while keeping responses under 120 characters. Engage them with one question at a time.',
    summaryPrompt: 'As per conversation, provide feedback along with areas for improvement in a well-structured format.',
    abstract: '/ab3.png'
  },
  {
    name: 'Learn Language',
    icon: <ThirdIcon className="w-50 h-50 text-primary" />,
    prompt: 'You are a helpful AI voice coach assisting users in learning {user_topic}. Provide pronunciation guidance, vocabulary tips, and interactive exercises. Keep responses friendly, engaging, and concise, ensuring clarity within 120 characters.',
    summaryPrompt: 'As per conversation, generate well-structured notes.',
    abstract: '/ab4.png'
  },
  {
    name: 'HR Round',
   icon: <FourthIcon className="w-50 h-50 text-primary" />,
    prompt: 'You are a helpful AI voice coach assisting users in learning {user_topic}. Provide pronunciation guidance, vocabulary tips, and interactive exercises. Keep responses friendly, engaging, and concise, ensuring clarity within 120 characters.',
    summaryPrompt: 'As per conversation, generate well-structured notes.',
    abstract: '/ab4.png'
  },
];

export interface CoachingExpert {
  name: string;
  avatar: string;
  pro: boolean;
}

export const CoachingExperts: CoachingExpert[] = [
  {
    name: 'Joanna',
    avatar: '/t1.avif',
    pro: false
  },
  {
    name: 'Salli',
    avatar: '/t2.jpg',
    pro: false
  },
  {
    name: 'Joey',
    avatar: '/t3.jpg',
    pro: false
  }
];

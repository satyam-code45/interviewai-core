// components/mcq/questions.ts

export interface MCQQuestion {
  id: number;
  category: string;
  role?: string;   // For role-based / scenario questions
  topic?: string;  // For aptitude / subject-based questions
  question: string;
  options: string[];
  correct_answer: string;
}

export const MCQ_QUESTIONS: MCQQuestion[] = [
  /* ======================================================
     QUANTITATIVE APTITUDE
  ====================================================== */
  {
    id: 1,
    category: "Quantitative Aptitude",
    topic: "Time and Work",
    question:
      "A can do a piece of work in 12 days and B in 15 days. They work together for 5 days and then B leaves. The days taken by A to finish the remaining work is:",
    options: ["3 days", "5 days", "10 days", "12 days"],
    correct_answer: "3 days",
  },
  {
    id: 2,
    category: "Quantitative Aptitude",
    topic: "Pipes and Cisterns",
    question:
      "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are used together, then how long will it take to fill the tank?",
    options: ["12 min", "15 min", "25 min", "50 min"],
    correct_answer: "12 min",
  },
  {
    id: 3,
    category: "Quantitative Aptitude",
    topic: "Profit and Loss",
    question:
      "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:",
    options: ["15", "16", "18", "25"],
    correct_answer: "16",
  },
  {
    id: 4,
    category: "Quantitative Aptitude",
    topic: "Trains",
    question:
      "A train 125 m long passes a man running at 5 km/hr in the same direction in 10 seconds. The speed of the train is:",
    options: ["45 km/hr", "50 km/hr", "54 km/hr", "55 km/hr"],
    correct_answer: "50 km/hr",
  },
  {
    id: 5,
    category: "Quantitative Aptitude",
    topic: "Simple Interest",
    question:
      "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    correct_answer: "Rs. 698",
  },

  /* ======================================================
     LOGICAL REASONING
  ====================================================== */
  {
    id: 21,
    category: "Logical Reasoning",
    topic: "Series Completion",
    question:
      "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?",
    options: ["7", "10", "12", "13"],
    correct_answer: "10",
  },
  {
    id: 22,
    category: "Logical Reasoning",
    topic: "Analogy",
    question: "Odometer is to mileage as compass is to?",
    options: ["Speed", "Hiking", "Needle", "Direction"],
    correct_answer: "Direction",
  },
  {
    id: 23,
    category: "Logical Reasoning",
    topic: "Coding-Decoding",
    question:
      "If 'PARK' is coded as '5394', 'SHIRT' as '17698', how is 'NISHAR' written?",
    options: ["266734", "231954", "201739", "261739"],
    correct_answer: "261739",
  },

  /* ======================================================
     VERBAL ABILITY
  ====================================================== */
  {
    id: 34,
    category: "Verbal Ability",
    topic: "Synonyms",
    question: "Choose the synonym of: CORPULENT",
    options: ["Lean", "Gaunt", "Emaciated", "Obese"],
    correct_answer: "Obese",
  },
  {
    id: 35,
    category: "Verbal Ability",
    topic: "Antonyms",
    question: "Choose the antonym of: MITIGATE",
    options: ["Abate", "Aggravate", "Allay", "Alleviate"],
    correct_answer: "Aggravate",
  },

  /* ======================================================
     TECHNICAL (BASIC)
  ====================================================== */
  {
    id: 49,
    category: "Technical (Basic)",
    topic: "Computer Fundamentals",
    question: "1 Byte is equal to:",
    options: ["8 bits", "4 bits", "16 bits", "32 bits"],
    correct_answer: "8 bits",
  },
  {
    id: 50,
    category: "Technical (Basic)",
    topic: "Networking",
    question: "Which protocol is used to send email?",
    options: ["HTTP", "FTP", "SMTP", "POP3"],
    correct_answer: "SMTP",
  },

  /* ======================================================
     MERN STACK
  ====================================================== */
  {
    id: 101,
    category: "MERN Stack",
    role: "MERN Developer",
    question:
      "API responses are slow under peak load. What do you do?",
    options: [
      "Upgrade RAM",
      "Restart server",
      "Add DB indexes and Redis caching",
      "Move DB to JSON",
    ],
    correct_answer: "Add DB indexes and Redis caching",
  },
  {
    id: 102,
    category: "MERN Stack",
    role: "MERN Developer",
    question:
      "How do you add real-time notifications?",
    options: [
      "Short polling",
      "WebSockets (Socket.io)",
      "Emails",
      "Page refresh",
    ],
    correct_answer: "WebSockets (Socket.io)",
  },

  /* ======================================================
     FLUTTER
  ====================================================== */
  {
    id: 201,
    category: "Flutter",
    role: "Flutter Developer",
    question:
      "Flutter plugin breaks after SDK upgrade. What do you do?",
    options: [
      "Downgrade or fork plugin",
      "Rewrite app",
      "Delete feature",
      "Wait",
    ],
    correct_answer: "Downgrade or fork plugin",
  },

  /* ======================================================
     NEXT.JS
  ====================================================== */
  {
    id: 301,
    category: "Next.js",
    role: "Full-Stack Developer",
    question:
      "Next.js builds are slow. How do you optimize?",
    options: [
      "Switch framework",
      "Use ISR / caching",
      "Remove CSS",
      "Upload build",
    ],
    correct_answer: "Use ISR / caching",
  },

  /* ======================================================
     GEN AI
  ====================================================== */
  {
    id: 401,
    category: "Gen AI",
    role: "Gen AI Developer",
    question:
      "LLM hallucinates in production. What do you implement?",
    options: [
      "Increase temperature",
      "RAG",
      "Disable model",
      "Retrain blindly",
    ],
    correct_answer: "RAG",
  },

  /* ======================================================
     BEHAVIORAL / SCENARIO
  ====================================================== */
  {
    id: 501,
    category: "Conflict & Teamwork",
    role: "General",
    question:
      "You disagree with a teammate on design. What do you do?",
    options: [
      "Escalate",
      "Force your design",
      "Prototype and compare",
      "Stay silent",
    ],
    correct_answer: "Prototype and compare",
  },
];

export function generateSummary(conversation: any[]) {
  return `
## Mock Interview Summary

**Topic:** Software Engineering (FAANG)

### Conversation Overview
- Discussed TypeScript basics
- Covered types vs interfaces
- Interview-style questioning

### Candidate Strengths
- Asked relevant questions
- Demonstrated learning mindset
- Followed up on concepts

### Areas for Improvement
- Deeper real-world TypeScript usage
- More system-level thinking

### Final Verdict
Good foundational knowledge. With practice, the candidate can perform well in technical interviews.
`.trim();
}

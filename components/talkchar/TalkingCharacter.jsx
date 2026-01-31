// import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
// import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
// import { RiTa } from 'rita';

// // Improved phoneme to viseme mapping
// const phonemeToViseme = {
//   // Closed mouth (M, B, P)
//   'M': 0, 'B': 0, 'P': 0,
  
//   // Lips together/rounded (F, V)
//   'F': 1, 'V': 1,
  
//   // Teeth visible (TH, DH, S, Z)
//   'TH': 2, 'DH': 2, 'S': 2, 'Z': 2,
  
//   // Narrow (EE, I)
//   'IY': 3, 'IH': 3, 'EY': 3,
  
//   // Relaxed (UH, ER)
//   'AH': 4, 'UH': 4, 'ER': 4,
  
//   // Lip rounded (OO, U, W)
//   'UW': 5, 'UU': 5, 'W': 5, 'OW': 5,
  
//   // Slightly open (EH, AE)
//   'EH': 6, 'AE': 6,
  
//   // Medium open (AA, AO)
//   'AA': 7, 'AO': 7, 'AW': 7,
  
//   // Wide open (AH, AY)
//   'AY': 8, 'AI': 8,
  
//   // Very wide (for emphasis)
//   'AA1': 9, 'AO1': 9,
  
//   // Consonants
//   'T': 2, 'D': 2, 'N': 2, 'L': 3, 'R': 4,
//   'K': 4, 'G': 4, 'NG': 4,
//   'CH': 3, 'JH': 3, 'SH': 2, 'ZH': 2,
//   'HH': 4, 'Y': 3,
// };

// const TalkingCharacter = forwardRef(function TalkingCharacter({ 
//   onSpeakStart, 
//   onSpeakEnd,
//   className,
//   style
// }, ref) {
//   const [voices, setVoices] = useState([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
  
//   const intervalRef = useRef(null);
//   const startTimeRef = useRef(0);

//   // Load Rive
//   const { rive, RiveComponent } = useRive({
//     src: '/character.riv', 
//     stateMachines: 'State Machine 1', 
//     autoplay: true,
//   });

//   // Get the lip sync input
//   const lipInput = useStateMachineInput(rive, 'State Machine 1', 'lipsid');

//   // Load voices
//   useEffect(() => {
//     const load = () => {
//       const loadedVoices = window.speechSynthesis.getVoices();
//       setVoices(loadedVoices);
//     };
//     load();
//     window.speechSynthesis.onvoiceschanged = load;
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       window.speechSynthesis.cancel();
//     };
//   }, []);

//   // Process text to phonemes with better parsing
//   const getPhonemes = useCallback((inputText) => {
//     try {
//       // Split into words
//       const words = inputText.toLowerCase().split(/\s+/);
//       const allPhonemes = [];

//       words.forEach((word, wordIndex) => {
//         // Get phonemes for this word
//         const phonemeString = RiTa.phones(word);
        
//         if (phonemeString) {
//           // Split and clean phonemes
//           const wordPhonemes = phonemeString
//             .split(/[\s-]+/)
//             .map(p => p.replace(/[0-9]/g, '').toUpperCase())
//             .filter(p => p.length > 0);
          
//           allPhonemes.push(...wordPhonemes);
          
//           // Add slight pause between words (use closed mouth)
//           if (wordIndex < words.length - 1) {
//             allPhonemes.push('PAUSE');
//           }
//         }
//       });

//       return allPhonemes;
//     } catch (e) {
//       console.error('Phoneme generation error:', e);
//       return [];
//     }
//   }, []);

//   // Speak with improved timing
//   const speak = useCallback(() => {
//     if (!lipInput) {
//       alert('Lip input not ready!');
//       return;
//     }

//     // Reset everything
//     window.speechSynthesis.cancel();
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
    
//     lipInput.value = 0;
//     setIsSpeaking(true);
//     setCurrentPhoneme('');

//     // Get phonemes
//     const phonemes = getPhonemes(text);
//     console.log('🗣️ Phonemes:', phonemes);
//     setDebugPhonemes(phonemes);

//     if (phonemes.length === 0) {
//       setIsSpeaking(false);
//       return;
//     }

//     // Create utterance
//     const utter = new window.SpeechSynthesisUtterance(text);
//     utter.rate = 0.9; // Slightly slower for better sync
//     utter.pitch = 1.0;
//     utter.volume = 1.0;
    
//     if (voices.length > 0) {
//       utter.voice = voices[0];
//     }

//     // Calculate timing
//     const estimatedDuration = text.split(' ').length * 0.5; // rough estimate in seconds
//     const msPerPhoneme = (estimatedDuration * 1000) / phonemes.length;
//     const adjustedMsPerPhoneme = Math.max(50, Math.min(150, msPerPhoneme)); // Between 50-150ms

//     console.log(`⏱️ Timing: ${adjustedMsPerPhoneme}ms per phoneme`);

//     let currentIndex = 0;

//     utter.onstart = () => {
//       console.log('🎤 Speech started');
//       startTimeRef.current = Date.now();

//       // Animate phonemes
//       intervalRef.current = setInterval(() => {
//         if (currentIndex >= phonemes.length) {
//           lipInput.value = 0;
//           setCurrentPhoneme('');
//           setIsSpeaking(false);
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return;
//         }

//         const phoneme = phonemes[currentIndex];
//         let viseme = 0;

//         if (phoneme === 'PAUSE') {
//           viseme = 0; // Closed for pause
//         } else {
//           viseme = phonemeToViseme[phoneme] ?? 4; // Default to relaxed mouth
//         }

//         lipInput.value = viseme;
//         setCurrentPhoneme(`${phoneme} → ${viseme}`);
        
//         console.log(`👄 [${currentIndex}/${phonemes.length}] ${phoneme} → ${viseme}`);
//         currentIndex++;
//       }, adjustedMsPerPhoneme);
//     };

//     utter.onend = () => {
//       console.log('🎤 Speech ended');
//       lipInput.value = 0;
//       setCurrentPhoneme('');
//       setIsSpeaking(false);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };

//     utter.onerror = (e) => {
//       console.error('❌ Speech error:', e);
//       lipInput.value = 0;
//       setIsSpeaking(false);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };

//     // Start speaking
//     window.speechSynthesis.speak(utter);
//   }, [text, lipInput, voices, getPhonemes]);

//   // Stop speaking
//   const stop = useCallback(() => {
//     window.speechSynthesis.cancel();
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (lipInput) {
//       lipInput.value = 0;
//     }
//     setIsSpeaking(false);
//     setCurrentPhoneme('');
//   }, [lipInput]);

//   // Manual test
//   const testMouth = (value) => {
//     if (lipInput) {
//       lipInput.value = value;
//       setTimeout(() => { lipInput.value = 0; }, 500);
//     }
//   };

//   return (
//     <div style={{ 
//       fontFamily: 'Arial, sans-serif', 
//       padding: 20, 
//       maxWidth: 900,
//       margin: '0 auto'
//     }}>
//       <h2 style={{ textAlign: 'center' }}>🗣️ Talking Character - Fixed</h2>
      
//       {/* Status */}
//       <div style={{ 
//         background: lipInput ? '#d4edda' : '#f8d7da',
//         padding: 15,
//         marginBottom: 20,
//         borderRadius: 8,
//         textAlign: 'center',
//         border: lipInput ? '2px solid #28a745' : '2px solid #dc3545'
//       }}>
//         <strong>Status: </strong>
//         {lipInput ? 
//           <span style={{color:'#28a745'}}>✅ Connected</span> : 
//           <span style={{color:'#dc3545'}}>❌ Not Connected</span>
//         }
//         {isSpeaking && <span style={{marginLeft: 20, color: '#007bff'}}>🎤 Speaking...</span>}
//       </div>

//       <div style={{ display: 'flex', gap: 20 }}>
//         {/* Rive Canvas */}
//         <div style={{ flex: 1 }}>
//           <div style={{ 
//             width: '100%', 
//             height: 400, 
//             background: '#f0f0f0',
//             border: '3px solid #333',
//             borderRadius: 8
//           }}>
//             <RiveComponent />
//           </div>

//           {/* Manual Tests */}
//           <div style={{ marginTop: 15, textAlign: 'center' }}>
//             <strong>Manual Tests:</strong>
//             <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
//               {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(val => (
//                 <button 
//                   key={val}
//                   onClick={() => testMouth(val)}
//                   style={{ 
//                     padding: '8px 12px',
//                     background: '#007bff',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: 4,
//                     cursor: 'pointer'
//                   }}
//                 >
//                   {val}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Debug Panel */}
//         <div style={{ 
//           width: 300, 
//           background: '#f8f9fa',
//           padding: 15,
//           borderRadius: 8,
//           border: '1px solid #dee2e6'
//         }}>
//           <h3 style={{ marginTop: 0 }}>Debug Info</h3>
          
//           {currentPhoneme && (
//             <div style={{ 
//               background: '#fff3cd',
//               padding: 10,
//               borderRadius: 4,
//               marginBottom: 10
//             }}>
//               <strong>Current:</strong> {currentPhoneme}
//             </div>
//           )}

//           <div style={{ marginTop: 10 }}>
//             <strong>Phonemes ({debugPhonemes.length}):</strong>
//             <div style={{ 
//               maxHeight: 200,
//               overflow: 'auto',
//               background: 'white',
//               padding: 10,
//               marginTop: 5,
//               fontSize: 12,
//               borderRadius: 4
//             }}>
//               {debugPhonemes.map((p, i) => (
//                 <div key={i}>
//                   {i}: {p} → {phonemeToViseme[p] ?? '?'}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div style={{ marginTop: 20 }}>
//         <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
//           <input 
//             value={text} 
//             onChange={(e) => setText(e.target.value)} 
//             style={{ 
//               flex: 1,
//               padding: 12,
//               fontSize: 16,
//               borderRadius: 4,
//               border: '2px solid #ced4da'
//             }}
//             placeholder="Enter text to speak..."
//           />
//         </div>
        
//         <div style={{ display: 'flex', gap: 10 }}>
//           <button 
//             onClick={speak}
//             disabled={!lipInput || isSpeaking}
//             style={{ 
//               flex: 1,
//               padding: '12px 24px',
//               fontSize: 16,
//               background: (!lipInput || isSpeaking) ? '#6c757d' : '#28a745',
//               color: 'white',
//               border: 'none',
//               borderRadius: 4,
//               cursor: (!lipInput || isSpeaking) ? 'not-allowed' : 'pointer',
//               fontWeight: 'bold'
//             }}
//           >
//             {isSpeaking ? '🎤 Speaking...' : '🗣️ Speak'}
//           </button>
          
//           <button 
//             onClick={stop}
//             disabled={!isSpeaking}
//             style={{ 
//               padding: '12px 24px',
//               fontSize: 16,
//               background: !isSpeaking ? '#6c757d' : '#dc3545',
//               color: 'white',
//               border: 'none',
//               borderRadius: 4,
//               cursor: !isSpeaking ? 'not-allowed' : 'pointer',
//               fontWeight: 'bold'
//             }}
//           >
//             ⏹️ Stop
//           </button>
//         </div>

//         {/* Quick test phrases */}
//         <div style={{ marginTop: 15 }}>
//           <strong>Quick tests:</strong>
//           <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
//             {[
//               "Hello world",
//               "How are you?",
//               "The quick brown fox",
//               "Testing one two three"
//             ].map((phrase, i) => (
//               <button
//                 key={i}
//                 onClick={() => setText(phrase)}
//                 style={{
//                   padding: '8px 12px',
//                   background: '#6c757d',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: 4,
//                   cursor: 'pointer',
//                   fontSize: 14
//                 }}
//               >
//                 "{phrase}"
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
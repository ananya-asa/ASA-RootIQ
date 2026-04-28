const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/analyze', async (req, res) => {
  const { code, error, mode } = req.body;

  const prompt = mode === 'quick'
    ? `You are ASA RootIQ. A student has this error:
ERROR: ${error}
CODE: ${code}
Reply in EXACTLY this format, nothing else:
PROBLEM: (one sentence, max 10 words)
FIX: (corrected code only, no explanation)`

    :`You are a world-class frontend engineer, creative coder, and animation expert.
    Your task is to turn a coding error into a HIGHLY INTERACTIVE, FUN, ANIMATED LEARNING EXPERIENCE like a mini Duolingo-style web app for debugging.
    
    ERROR: ${error}
    CODE: ${code}
    
    ⚠️ STRICT OUTPUT RULES (NON-NEGOTIABLE):
    - Output ONLY raw HTML
    - Start EXACTLY with: <!DOCTYPE html>
    - No markdown, no backticks, no explanations
    - No text before or after the code
    - Must run directly without modification
    - Everything in ONE file (HTML + CSS + JS inside)
    
    🏷️ MANDATORY HEADER (FIRST THING ON PAGE):
    - Large "ASA RootIQ" title at top with purple glow (#7c6af7)
    - Subtitle: "Your AI Debugging Mentor"
    - XP counter and progress bar below header
    
    📜 MANDATORY 7-STEP FLOW (ALL STEPS REQUIRED):
    Step 1 - ENCOUNTER: Show the error dramatically with shake animation
    Step 2 - UNDERSTAND: Explain what went wrong in simple words
    Step 3 - ROOT CAUSE: Explain WHY it happened (animated diagram)
    Step 4 - HINT: Give a hint, let student think (countdown timer 10 seconds)
    Step 5 - FIX STEP 1: Show first part of fix with animation
    Step 6 - FIX STEP 2: Show complete fix with before/after comparison
    Step 7 - QUIZ + CELEBRATION: MCQ then Duolingo-style blast
    
    Each step must:
    - Have its own button to proceed
    - Award XP when completed (+50 XP per step)
    - Update progress bar
    - Animate in smoothly
    
    🎯 EXPERIENCE GOAL:
    Make it feel like a premium interactive product, not a tutorial.
    User should LEARN by interacting, not reading.
    
    🎨 UI DESIGN:
    - Dark modern UI (#0f0f1a background, #1e1e2e cards)
    - Accent color: #7c6af7 (glow effects)
    - Big bold typography (16px+)
    - Glassmorphism / soft shadows / smooth gradients
    - Centered responsive layout
    - html, body must have overflow-y: auto to allow scrolling
    - Never use fixed heights that prevent scrolling
    
    ✨ ANIMATIONS (VERY IMPORTANT):
    - Floating particles in background
    - Smooth page transitions
    - Elements fade, slide, scale dynamically
    - Error box shakes violently when triggered
    - Glow + pulse effects on important elements
    - Moving arrows showing execution flow
    - Variables animating into memory boxes
    - Broken flow animation when error occurs
    
    🎊 DUOLINGO-STYLE QUIZ CELEBRATION (MANDATORY):
    When correct answer selected:
    - Create 80+ confetti pieces using JS
    - Each confetti = colored div flying in random directions
    - Screen flash green
    - "CORRECT! 🎉" message pops up with scale animation
    - +100 XP awarded with floating XP text animation
    - Sound-like visual pulse effect
    
    When wrong answer:
    - Red shake animation on selected option
    - "Try Again!" message
    - -10 XP penalty shown
    
    🎮 GAMIFICATION:
    - Start with 100 XP
    - +50 XP per step completed
    - +100 XP for correct quiz answer
    - Progress bar fills as steps complete
    - Final celebration screen when all done
    
    📊 VISUAL DEBUGGING:
    - Animated code execution diagram
    - Boxes showing variables in memory
    - Red arrow pointing to exact error location
    - Before/after code comparison in Step 6
    
    ⚠️ VS CODE WEBVIEW COMPATIBILITY (CRITICAL):
    - NEVER use onclick="..." inline attributes
    - ALWAYS use addEventListener inside script tags
    - NEVER use eval() or Function()
    - ALL event handling must be inside DOMContentLoaded:
      document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('btnId').addEventListener('click', function() { ... });
      });
    
    💡 CODE QUALITY:
    - CSS keyframes + transitions for all animations
    - JS setTimeout and event listeners for sequencing
    - No external libraries at all

    ⚠️ BUTTON COMPATIBILITY:
- All buttons must have cursor: pointer in CSS
- Buttons must have z-index: 999
- Never place divs over buttons that block clicks
- Test that all buttons are fully clickable
    
    🏁 Return ONLY the complete working HTML file starting with <!DOCTYPE html>`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    res.json({ success: true, analysis: response });

    await db.collection('sessions').add({
      code,
      error,
      mode,
      analysis: response,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: 'ASA RootIQ Backend is running! 🚀' });
});

app.listen(process.env.PORT, () => {
  console.log(`ASA RootIQ backend running on port ${process.env.PORT}`);
});
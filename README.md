# ⚡ ASA RootIQ — AI Debugging Mentor

> **Don't just fix bugs. Understand them.**

ASA RootIQ is a VS Code extension that turns every coding error into an interactive, animated learning experience — like Duolingo, but for debugging.

---

## 🎯 The Problem

Every CS student has copy-pasted a fix from ChatGPT without understanding it. Existing AI tools like GitHub Copilot fix bugs — but they don't teach you *why* the bug happened.

This creates a major gap: not in coding ability, but in **thinking ability**.

Only ~10% of Indian engineering graduates can write functionally correct code. Debugging is the bottleneck — and no tool is designed to teach it.

---

## 💡 The Solution

ASA RootIQ is a **VS Code extension + web dashboard** that:

- 🔍 **Auto-detects errors** — both static (red squiggles) and runtime errors
- ⚡ **Quick Fix mode** — instantly shows the problem + applies fix to editor (like Copilot)
- 🎓 **Learn Mode** — generates a fully animated, interactive Duolingo-style lesson for every error using Gemini AI
- 📊 **Web Dashboard** — tracks your progress, concept mastery, streaks, and XP

---

## ✨ Key Features

### ⚡ Quick Fix
- Auto-captures error from your file
- Shows 2-line diagnosis popup
- One-click fix applied directly to editor
- For when you're in a hackathon at 3AM 😄

### 🎓 Learn Mode (The Magic)
- Gemini AI generates a **custom animated HTML page** for your specific error
- 7-step interactive flow: Encounter → Understand → Root Cause → Hint → Fix Step 1 → Fix Step 2 → Quiz
- XP system (+50 XP per step)
- Progress bar
- Duolingo-style MCQ quiz with confetti celebration on correct answer 🎉
- Shake animation on wrong answer

### 📊 Web Dashboard
- Bugs mastered, streaks, XP tracking
- Error breakdown charts
- 7-day activity graph
- Concept mastery tracking (Syntax, TypeError, NameError, etc.)
- Leaderboard (Early Beta)
- Session history feed

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| VS Code Extension | Node.js, VS Code Extension API |
| Backend | Node.js, Express, Cloud Run |
| AI | Google Gemini 2.5 Flash API |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google) |
| Web Dashboard | React, Recharts |
| Hosting | Firebase Hosting |
| Error Capture | VS Code Diagnostics API + child_process |

---

## 🏗️ Architecture

```
Student hits error in VS Code
        ↓
Extension auto-captures error + code
        ↓
Sends to Express backend (Cloud Run)
        ↓
Gemini API generates animated HTML lesson
        ↓
Extension renders it in VS Code webview
        ↓
Session saved to Firestore
        ↓
Progress visible on web dashboard
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- VS Code
- Python (for testing Python error detection)

### 1. Clone the repo
```bash
git clone https://github.com/ananya-asa/ASA-RootIQ.git
cd ASA-RootIQ
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

Add your Firebase `serviceAccount.json` to the backend folder.

```bash
node index.js
```

### 3. Setup VS Code Extension
```bash
cd extension/asa-rootiq
npm install
```

Open in VS Code and press `F5` to launch Extension Development Host.

### 4. Setup Web Dashboard
```bash
cd web
npm install
```

Create `web/.env`:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
```

```bash
npm start
```

---

## 🎮 How to Use

1. Open any code file in VS Code
2. Write (or have) buggy code
3. Open Command Palette (`Ctrl+Shift+P`)
4. Type **"ASA RootIQ"**
5. Choose:
   - **⚡ Quick Fix** — instant fix applied to editor
   - **🎓 Learn with ASA RootIQ** — full animated lesson

---

## 📊 How It's Different from Copilot

| Feature | Other Ai s | ASA RootIQ |
|---------|---------------|------------|
| Primary goal | Faster code writing | Stronger debugging skills |
| Interaction | Inline suggestions | Interactive 7-step lesson |
| Success metric | Lines generated | Concepts mastered |
| Target user | All developers | Student developers |
| Learning analytics | None | Full progress dashboard |
| Quiz system | ❌ | ✅ With celebration |
| XP & Gamification | ❌ | ✅ Duolingo-style |

---

## 🗺️ Roadmap

- [ ] VS Code Marketplace publish
- [ ] Multi-language support (Java, C++, JS)
- [ ] Debugger integration (breakpoints → auto-capture)
- [ ] Multi-file error analysis
- [ ] Concept mastery recommendations
- [ ] Campus/cohort analytics for faculty
- [ ] Collaborative debugging sessions

---

## 🎯 GDG Solution Challenge 2026

**Theme:** Open Innovation — Smart Resource Allocation

**SDGs:** SDG 4 (Quality Education) + SDG 8 (Decent Work & Economic Growth)

**Impact:** Democratizing high-quality debugging mentorship for Indian student developers — regardless of college tier or background.

---

## 👩‍💻 Built By

**Ananya** — CS Engineering Student, SJEC Mangaluru  


*Built with 💜 and a lot of debugging*

---

## 📄 License

MIT License — feel free to use, modify, and build on this!

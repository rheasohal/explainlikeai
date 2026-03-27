# ExplainLikeAI  
**An intelligent learning companion that explains any concept at your level — in a way that actually makes sense.**

ExplainLikeAI uses AI to generate **personalized explanations, flashcards, quizzes, and mind maps**, all tailored to your learning level and interests.


## Features

### Core Learning Engine
- **Adjustable explanation levels:**  
  Child → Teen → Beginner → Intermediate → Expert  
- **Personalized analogies** based on your interests:  
  *Chef, Athlete, Programmer, Musician, etc.*  
- Real-time streaming responses *(no waiting for full output)*  


### Flashcards & Quiz Mode
- Auto-generate flashcards from any explanation  
- Flip-card UI with self-evaluation:
  - Got it  
  - Almost  
  - Missed it  
- Smart repetition *(missed cards appear more often)*  
- Quiz mode with MCQs and final scoring  


### PDF Export
Export formatted learning material including:
- Topic  
- Level  
- Interest profile  
- AI-generated explanation  
- Follow-up Q&A  

Flashcards can also be exported in **printable grid format**


### Follow-up Q&A
- Ask unlimited questions  
- AI remains aligned with your selected level  
- Full conversation history maintained  

---

### Side-by-Side Comparison
- Compare explanations across levels *(e.g., Child vs Expert)*  
- Useful for teachers and deeper understanding  

---

### Related Concepts
- AI suggests 3 connected topics  
- One-click exploration  
- Builds a structured learning trail  

---

### Mind Maps
- Visual representation of key ideas  
- Helps connect concepts efficiently  

---

## Tech Stack

| Layer        | Technology              | Purpose                              |
|-------------|------------------------|--------------------------------------|
| Frontend    | React + Vite           | Fast development and modular UI      |
| Styling     | Tailwind CSS           | Utility-first styling                |
| State       | Zustand                | Lightweight global state             |
| AI          | Gemini API             | Content generation                   |
| PDF Export  | jsPDF + html2canvas    | Client-side PDF generation           |
| Animations  | Framer Motion          | Smooth UI interactions               |
| Routing     | React Router           | Multi-page navigation                |
| Hosting     | Vercel                 | Deployment                           |

---

## Project Structure

src/
│
├── pages/ # App pages (Explain, Quiz, Flashcards)
├── services/
│ └── gemini.ts # API integration
├── store/
│ └── useStore.ts # Global state (Zustand)
├── utils/
│ └── exportPdf.ts # PDF export logic
│
├── App.tsx
├── main.tsx
└── index.css


---

## Environment Variables

Create a `.env.local` file in the root:
VITE_GEMINI_API_KEY=your_api_key_here


This file is ignored via `.gitignore` and should not be pushed to GitHub.

---

## Installation and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/adaptive-learning-ai.git

# Navigate into the project
cd adaptive-learning-ai

# Install dependencies
npm install

# Start development server
npm run dev


Deployment

Deployed using Vercel:

Push repository to GitHub
Import into Vercel
Add environment variable:
VITE_GEMINI_API_KEY
Deploy
Use Cases
Students learning complex topics
Teachers creating differentiated content
Self-learners seeking intuitive explanations
Revision through flashcards and quizzes
Future Improvements
Authentication and database integration (save sessions)
Dark mode
Shareable learning sessions
Mobile optimization
Voice-based explanations
Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss proposed updates.

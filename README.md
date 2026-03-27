ExplainLikeAI
An intelligent learning companion that explains any concept at your level, in a way that actually makes sense to you.
This app uses AI to generate personalized explanations, flashcards, quizzes, and mind maps — all tailored to your learning level and interests.

Features
Core Learning Engine
  •	Adjustable explanation levels:
    o	Child → Teen → Beginner → Intermediate → Expert
  •	Personalized analogies based on your interests:
    o	Chef, Athlete, Programmer, Musician, etc.
  •	Real-time streaming responses (no waiting for full output)

Flashcards & Quiz Mode
  •	Auto-generate flashcards from any explanation
  •	Flip-card UI with self-evaluation:
    o	Got it
    o	Almost
    o	Missed it
  •	Smart repetition: missed cards appear more often
  •	Quiz mode with MCQs and final scoring

PDF Export
  •	Export full explanations as formatted PDFs
  •	Includes:
    o	Topic
    o	Level
    o	Interest profile
    o	AI-generated explanation
    o	Follow-up Q&A
  •	Flashcards exportable in printable grid format

Follow-up Q&A
  •	Ask unlimited questions after explanation
  •	AI stays locked to your selected level
  •	Full conversation history maintained

Side-by-Side Comparison
  •	Compare explanations across levels (e.g., Child vs Expert)
  •	Useful for teachers and deeper understanding

Related Concepts
  •	AI suggests 3 connected topics after each explanation
  •	Click to explore instantly
  •	Builds a learning trail

Mind Maps
  •	Visual representation of key ideas
  •	Helps connect concepts quickly

Tech Stack
Layer	Technology	Purpose
Frontend	React + Vite	Fast development and modular UI
Styling	Tailwind CSS	Utility-first styling
State	Zustand	Lightweight global state
AI	Gemini API	Personalized explanations and content generation
PDF Export	jsPDF + html2canvas	Client-side PDF generation
Animations	Framer Motion	Smooth UI interactions
Routing	React Router	Multi-page navigation
Hosting	Vercel	Deployment

Project Structure
  src/
  │
  ├── pages/              # App pages (Explain, Quiz, Flashcards)
  ├── services/
  │   └── gemini.ts      # API integration
  ├── store/
  │   └── useStore.ts    # Global state (Zustand)
  ├── utils/
  │   └── exportPdf.ts   # PDF export logic
  │
  ├── App.tsx
  ├── main.tsx
  └── index.css

Environment Variables
Create a .env.local file in the root:
VITE_GEMINI_API_KEY=your_api_key_here
This file is ignored via .gitignore and should not be pushed to GitHub.

Installation and Setup
# Clone the repo
git clone https://github.com/your-username/adaptive-learning-ai.git

# Navigate into the project
cd adaptive-learning-ai

# Install dependencies
npm install

# Start development server
npm run dev


Deployment
Deployed using Vercel:
  1.	Push repo to GitHub
  2.	Import into Vercel
  3.	Add environment variable:
    o	VITE_GEMINI_API_KEY
  4.	Deploy

Use Cases
  •	Students learning complex topics
  •	Teachers creating differentiated content
  •	Self-learners who want intuitive explanations
  •	Revision through flashcards and quizzes

Future Improvements
  •	Save user sessions (authentication + database)
  •	Dark mode toggle
  •	Shareable learning sessions
  •	Mobile optimization
  •	Voice-based explanations

Contributing
  Pull requests are welcome. For major changes, open an issue first.


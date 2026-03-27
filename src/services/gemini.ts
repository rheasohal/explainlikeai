import { GoogleGenerativeAI, ChatSession, GenerativeModel } from '@google/generative-ai';
import { useStore } from '../store/useStore';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;
let chatSession: ChatSession | null = null;

// Lazily initialize the API to prevent fatal React crashes on page load if the API key is missing
const initAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No VITE_GEMINI_API_KEY found in .env.local!");
    return false;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return true;
};

export const streamExplanation = async (topic: string, level: string, interest: string) => {
  if (!initAPI() || !model) {
    useStore.getState().setExplanationText('Error: VITE_GEMINI_API_KEY is not defined in your environment (.env.local). Please create a .env.local file with VITE_GEMINI_API_KEY="YOUR_API_KEY".');
    return;
  }
  
  const prompt = `You are a world-class explainer app called ExplainLikeAI. 
Explain the concept of "${topic}" explicitly tailored for a "${level}" comprehension level. 
You MUST use an analogy specifically related to "${interest}".
Keep the explanation engaging, accurate, and perfectly matched to the requested complexity level. Structure it clearly.`;
  
  try {
    chatSession = model.startChat({
        history: [
            { role: "user", parts: [{ text: prompt }] }
        ]
    });

    const result = await model.generateContentStream(prompt);
    let fullText = '';
    
    useStore.getState().setIsStreaming(true);
    useStore.getState().setExplanationText('');
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      useStore.getState().setExplanationText(fullText);
    }
    
    useStore.getState().setIsStreaming(false);
    useStore.getState().addMessage({ role: 'model', content: fullText });
    
    generateFlashcards(topic, fullText, level);
    generateMindMapNodes(topic, fullText, level);
  } catch (err: any) {
    console.error(err);
    useStore.getState().setIsStreaming(false);
    useStore.getState().setExplanationText(`Oh no! The AI returned an error: ${err.message || err.toString()}`);
  }
};

export const generateFlashcards = async (topic: string, explanation: string, level: string) => {
  if (!initAPI() || !model) return;

  const prompt = `Based on the following explanation of "${topic}" at a "${level}" level, generate EXACTLY 5 flashcards.
Format the output as a valid JSON array of objects, where each object has "id" (a unique string integer like "1", "2"), "front" (a question or term), and "back" (the concise answer or definition).

Explanation context:
${explanation}

Only output the raw JSON array. Do not include markdown codeblocks (\`\`\`json) in your response, just the raw array.`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const flashcards = JSON.parse(cleanedText);
    
    useStore.getState().setFlashcards(flashcards);
  } catch(err) {
    console.error("Failed to generate flashcards", err);
  }
};

export const generateMindMapNodes = async (topic: string, explanation: string, level: string) => {
  if (!initAPI() || !model) return;

  const prompt = `Read this explanation about "${topic}" (aimed at a "${level}" level).
Generate a hierarchical Mind Map tree of up to 7 related concept nodes summarizing the structure.
Format strictly as a JSON array of objects, with NO markdown codeblocks (\`\`\`json).
Each object MUST have:
"id": unique string integer (e.g., "1", "2"). Output exactly 1 root node with "id": "1".
"label": a concise 2-5 word title for the concept.
"parentId": the string ID of the node it stems from, or null if it's the root node "1".

Explanation context:
${explanation}`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const concepts = JSON.parse(cleanedText);
    
    useStore.getState().setRelatedConcepts(concepts);
  } catch (err) {
    console.error("Failed to extract mind map concepts", err);
  }
};

export const sendFollowUpQuestion = async (message: string) => {
    if (!chatSession) return;
    
    useStore.getState().addMessage({ role: 'user', content: message });
    
    try {
        const result = await chatSession.sendMessage(message);
        useStore.getState().addMessage({ role: 'model', content: result.response.text() });
    } catch (err) {
        console.error("Chat error", err);
    }
};

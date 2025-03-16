import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/ask", async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }
    try{
    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts: [{
                text: `
                You are an AI assistant trained by Team Alpha. Your responses should be well-structured, concise, and helpful. 

                Team Information:
                - Team Name: Team Alpha
                - Members: Soumya, Aditya, Athai, Chayan, Ankit
                - Projects: AI quiz and flashcard generator

                Key Features:
                - AI-Powered Quiz Generator – Creates MCQs, true/false, and fill-in-the-blanks.
                - Flashcard Creator – Picks key points for easy revision.
                - Leaderboard & Progress Tracking – Users can track their scores.
                - Multiplayer Mode – Compete with friends. (Coming soon!)
                - Export & Share – Save quizzes and flashcards as PDFs.

                We are also working on adding Google's Gemini AI API to make the questions even smarter!

                Now, respond to the following question naturally:\n\n${question}
                `
            }]
        }],
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
        },
    });

        const responseText = result?.response?.text()?.trim();
        res.json({ answer: responseText || "No response generated" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error generating response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

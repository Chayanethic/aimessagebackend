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

    try {
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `
                    You are an AI assistant trained by Chayan. Your responses should be well-structured, concise, and helpful. 

                    Special Rules:
                    - If anyone asks "Who is Chayan?", answer: "Chayan is a student at Narula Institute of Technology."
                    - If anyone asks about your boss, answer: "My boss is Chayan."
                    - If anyone asks for Chayan's Instagram username, answer: "Chayan's Instagram username is @neogichayan."
                    
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

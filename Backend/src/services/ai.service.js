import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
);

class GroqModel {
    constructor(apiKey, modelName = "llama-3.3-70b-versatile") {
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    async invoke(messages) {
        const formattedMessages = messages.map(msg => {
            let role = "user";
            let content = msg.content || "";
            if (msg._getType && msg._getType() === "system") role = "system";
            else if (msg._getType && msg._getType() === "ai") role = "assistant";
            else if (msg._getType && msg._getType() === "human") role = "user";

            return { role, content };
        });

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: formattedMessages
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Groq API Status ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        return { text, messages: [new AIMessage(text)] };
    }
}

function getModel(modelChoice = "grok") {
    const groqKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

    if ((modelChoice === "grok" || modelChoice === "groq") && groqKey && groqKey !== "your_groq_api_key_here") {
        return new GroqModel(groqKey);
    }

    if (modelChoice === "gemini" && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
        return new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    if ((modelChoice === "mistral" || !modelChoice) && process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== "your_mistral_api_key_here") {
        return new ChatMistralAI({
            model: "mistral-medium-latest",
            apiKey: process.env.MISTRAL_API_KEY
        });
    }

    // Fallbacks
    if (groqKey && groqKey !== "your_groq_api_key_here") {
        return new GroqModel(groqKey);
    }

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
        return new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== "your_mistral_api_key_here") {
        return new ChatMistralAI({
            model: "mistral-medium-latest",
            apiKey: process.env.MISTRAL_API_KEY
        });
    }

    return null;
}

export async function generateResponse(messages, modelChoice = "grok") {
    console.log("Using model choice:", modelChoice);

    const model = getModel(modelChoice);
    if (!model) {
        return "⚠️ API Key missing: Please provide a valid GROQ_API_KEY, MISTRAL_API_KEY, or GEMINI_API_KEY in Backend/.env to enable live AI responses.";
    }

    try {
        const sysMsg = new SystemMessage(`
            You are a helpful and precise assistant for answering questions.
            If you don't know the answer, say you don't know. 
        `);

        const formattedMsgs = [
            sysMsg,
            ...(messages.map(msg => {
                if (msg.role === "user") {
                    return new HumanMessage(msg.content);
                } else if (msg.role === "ai") {
                    return new AIMessage(msg.content);
                }
            }))
        ];

        if (modelChoice === "grok" || modelChoice === "groq") {
            const res = await model.invoke(formattedMsgs);
            return res.text;
        }

        const agent = createAgent({
            model,
            tools: [searchInternetTool],
        });

        const response = await agent.invoke({
            messages: formattedMsgs
        });

        return response.messages[response.messages.length - 1].text;
    } catch (err) {
        console.error("AI Generation Error:", err.message);
        return `⚠️ AI Error: ${err.message || "Failed to generate AI response"}. Please check your API key in Backend/.env.`;
    }
}

export async function generateChatTitle(message, modelChoice = "grok") {
    const model = getModel(modelChoice);
    if (!model) {
        const words = message.trim().split(/\s+/).slice(0, 4).join(" ");
        return words || "New Chat";
    }

    try {
        const response = await model.invoke([
            new SystemMessage(`
                You are a helpful assistant that generates concise and descriptive titles for chat conversations.
                Generate a title in 2-4 words based on the user message. Return ONLY the title text.
            `),
            new HumanMessage(`Generate a title for: "${message}"`)
        ]);

        return response.text ? response.text.trim() : "New Chat";
    } catch (err) {
        console.error("Title Generation Error:", err.message);
        const words = message.trim().split(/\s+/).slice(0, 4).join(" ");
        return words || "New Chat";
    }
}

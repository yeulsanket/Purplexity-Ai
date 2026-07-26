import { tavily as Tavily } from "@tavily/core";

export const searchInternet = async ({ query }) => {
    if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "your_tavily_api_key_here") {
        console.log("Tavily API key not set; skipping web search.");
        return JSON.stringify({ results: [], message: "No Tavily API key provided." });
    }

    try {
        const tavily = Tavily({
            apiKey: process.env.TAVILY_API_KEY,
        });

        const results = await tavily.search(query, {
            maxResults: 5,
        });

        console.log(JSON.stringify(results));
        return JSON.stringify(results);
    } catch (err) {
        console.error("Tavily Search Error:", err.message);
        return JSON.stringify({ results: [], error: err.message });
    }
};
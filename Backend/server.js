import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import connectDB from "./src/config/database.js";
const PORT = process.env.PORT || 8000;


const httpServer = http.createServer(app);
connectDB()
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

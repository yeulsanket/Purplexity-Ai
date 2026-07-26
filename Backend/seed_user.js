import "dotenv/config";
import mongoose from "mongoose";
import userModel from "./src/models/user.model.js";

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const email = "test@example.com";
        const username = "testuser";
        const password = "password123";

        // Remove existing test user if present
        await userModel.deleteOne({ email });

        const user = new userModel({
            username,
            email,
            password,
            verified: true,
        });

        await user.save();
        console.log("Test user created successfully!");
        console.log("-----------------------------------");
        console.log(`Email:    ${email}`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log(`Verified: ${user.verified}`);
        console.log("-----------------------------------");

    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();

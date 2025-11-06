import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas!");
    }
    catch (err) {
        console.error("Failed to connect:", err.message);
    } 
    finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

main();
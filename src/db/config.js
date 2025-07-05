import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.DATABASE_URL}`);
        console.log(`\nDatabase successfully connected`);
    } catch (error) {
        console.log(`MongoDB connection failed: ${error.message}`);
    }
}

export default ConnectDB;
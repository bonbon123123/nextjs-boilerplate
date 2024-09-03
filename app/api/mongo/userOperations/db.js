import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URL_USERS, {
                autoIndex: true,
            });
            console.log("Newly connected");
        } else {
            console.log("Already connected");
        }
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw new Error("Database connection failed");
    }
};

export default dbConnect;
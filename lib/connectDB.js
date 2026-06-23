import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_DIRECT_URI = process.env.MONGO_DIRECT_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connect = (uri) =>
    mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGO_URI && !MONGO_DIRECT_URI) {
        throw new Error("Missing MongoDB connection string.");
    }

    if (!cached.promise) {
        cached.promise = connect(MONGO_URI || MONGO_DIRECT_URI).catch((error) => {
            cached.promise = null;

            const isSrvError =
                MONGO_URI &&
                MONGO_DIRECT_URI &&
                (error?.message?.includes("querySrv") ||
                    error?.message?.includes("ECONNREFUSED"));

            if (isSrvError) return connect(MONGO_DIRECT_URI);

            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

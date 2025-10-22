import mongoose from "mongoose";    

// Centralized DB connection with reasonable timeouts and modern parser options.
// These options make connection attempts fail faster (serverSelectionTimeoutMS)
// and avoid excessively long buffering when the DB is unreachable.
export const dbconnection = () => {
    const options = {
        dbName: "RESTAURANT",
        // Recommended Mongoose options
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Fail fast on server selection (ms)
        serverSelectionTimeoutMS: 10000,
        // Connection attempt timeout
        connectTimeoutMS: 10000,
        // How long mongoose will buffer operations when not connected (ms)
        bufferTimeoutMS: 10000,
    };

    return mongoose.connect(process.env.MONGO_URI, options)
    .then(() => {
        console.log(" connected to Database successfully");
    })
    .catch(err => {
        console.error(` some Error occured during connecting to database: ${err}`);
        throw err;
    });
};

// Helper for other modules to check connection state
export const isDbConnected = () => mongoose.connection.readyState === 1;


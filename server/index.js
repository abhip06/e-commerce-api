const app = require('./app');

require('dotenv').config({path: "server/config/.env"});
const PORT = process.env.PORT || 8080;

const connectDatabase = require('./config/dbConnect');

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err.message}`);
    console.log("Shuting down the server due to Uncaught Exception.");

    process.exit(1);
});

// connecting to database
connectDatabase();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});


// Unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`ERROR: ${err.message}`);
    console.log("Shuting down the server due to unhandled promise rejection.");

    server.close(() => {
        process.exit(1);
    })
});
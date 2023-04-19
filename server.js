const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
dotenv.config({ path: "config/config.env" });

//handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log("Error is ", err.message);
  console.log("Shutting down server due to unhandled exception");
  process.exit(1);
});
//connect to DB
connectDatabase();
const server = app.listen(process.env.PORT, () => {
  console.log("Server is running at port: " + process.env.PORT);
});
//unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log("Error : ", err.message);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});

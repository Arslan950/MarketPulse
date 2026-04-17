import 'dotenv/config';
import dotenv from "dotenv"
import app from "./app.js";
import connectDB from "./db/server.js";

const port = process.env.PORT;


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.log("❌ Connection Failed", err);
    process.exit(1);
  })
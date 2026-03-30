import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/server.js";
dotenv.config({
  path: "./.env"
});

const port = process.env.PORT;


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.log("❌ Connection Failed", error);
    process.exit(1);
  })
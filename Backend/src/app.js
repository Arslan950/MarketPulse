import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import healthCheckRouter from "./routes/healthCheck.route.js";
import authRouter from './routes/auth.route.js'
import productRouter from "./routes/product.route.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use("/api/v1/healthcheck" , healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/inventory",productRouter)

app.get("/", (req, res) => {
    res.send("Hello world");
});

export default app;
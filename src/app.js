import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import router from "./routes/user.routes"

const app = express()
app.use (cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import 
import userRouter from './routes/user.routes.js'

// routes declaration 
app.use("/api/v1/users", userRouter)

// https://localhost:8000/api/v1/users/register
// "dev": "nodemon -r dotenv/config src/index.js"
// "scripts": {
  // "dev": "nodemon src/index.js"

app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR:", err)
  
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    })
  })
  
export {app}


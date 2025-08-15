import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import { connectDB } from "./db/mongodb.config.js"
import { createServer  } from "http"
import cookieParser from "cookie-parser";
import { Server  } from "socket.io";
import { gameDataModel } from "./models/gameDataModel.js";

// routes
import authRoutes from "./routes/auth.route.js"
import gameDataRoutes from "./routes/gameData.route.js"
import ticketRoutes from "./routes/ticket.route.js"
import socketHandler from "./socket/socketHandler.js";


dotenv.config();
const app = express();
const server = createServer (app);

app.use(express.json());
app.use(cookieParser());

const FRONTEND_URL = process.env.NODE_ENV == "development" 
? "http://localhost:5173" 
: process.env.CLIENT_URL

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// routes
app.use("/api/auth", authRoutes); // user authentication
app.use("/api/gameData", gameDataRoutes); // CRUD operation for game datas
app.use("/api/ticket", ticketRoutes); // tickets operation

// test API
app.get("/", (req,res) => {
  res.json({message: "cors is working"});
})
app.get("/delete", async (req, res) => {
  const game = await gameDataModel.findById(req.query.id);
  game.gameStatus = "Preparation"
  game.callNum = [];
  game.winners.houseFull = [];
  game.winners.quickFive = [];
  game.winners.firstLine = [];
  game.winners.secondLine = [];
  game.winners.thirdLine = [];
  game.winners.set = [];
  game.winners.halfSet = [];
  await game.save()
  res.status(200).json({ gameData: game, success: true })
})


connectDB(); // mongoDB connect

// for real time programe
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  }
});
socketHandler(io);


const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`server is live : ${PORT}`);
  console.log(`FRONTEND_URL : ${FRONTEND_URL}`);
})

import mongoose from "mongoose";

const playerInfoSchema = new mongoose.Schema({
  ticket: {
    data: { type: Array, required: true },
    tno: { type: Number, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  playerID: { type: String, required: true }
});

const gameDataSchema = new mongoose.Schema(
  {
    numOfPlayers : { type: Number, default: 0 },
    numOfTickets : { type: Number, default: 0 },
    startAt : { type: Date, required: true },
    callNum : { type: Array, default: [] },
    isBookingOpen : { type: Boolean, default: false },
    gameStatus : { type: String, enum: ["Preparation", "Ongoing", "Game-Over"], default: "Preparation" },
    maxWinner : {
      quickFive: { type: Number, default: 0 },
      firstLine: { type: Number, default: 0  },
      secondLine: { type: Number, default: 0  },
      thirdLine: { type: Number, default: 0  },
      houseFull: { type: Number, default: 0  },
      set: { type: Number, default: 0  },
      halfSet: { type: Number, default: 0  }
    },
    winners : {
      quickFive: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      firstLine: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      secondLine: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      thirdLine: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      houseFull: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      set: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ],
      halfSet: [
        {rank: Number, prizeType: String, lastCall: Number, players: [playerInfoSchema]}
      ]
    },
  },
  { timestamps: true }
)


export const gameDataModel = mongoose.model("gameData", gameDataSchema);
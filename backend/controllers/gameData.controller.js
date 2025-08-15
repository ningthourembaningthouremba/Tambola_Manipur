import { gameDataModel } from "../models/gameDataModel.js"
import { ticketModel } from "../models/ticketsModel.js"

// upload a new game
export const gameUpload = async (req, res) => {
  const startAt = req.body.startAt;
  const maxWinner = {...req.body, startAt: undefined};

  try {
    const gameData = new gameDataModel({
      startAt,
      maxWinner
    });

    await gameData.save();

    res.status(201).json({ success: true, gameData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// view game data
export const gameView = async (req, res) => {
  const { _id } = req.body;
  try {
    // find the latest game
    if (_id == "latest") {
      const latestGame = await gameDataModel.findOne().sort({ createdAt: -1 })

      if (!latestGame) {
        return res.status(404).json({ success: false, message: "No game found" });
      }

      const allPlayers = await ticketModel.find({ gameID: latestGame._id })
      

      return res.status(200).json({ success: true, game: latestGame, players: allPlayers || [] })
    }
  
    // const game = await gameDataModel.findById(_id);

    // if (!game) {
    //   return res.status(404).json({ success: false, message: "game is not found" });
    // }
    // res.status(200).json({ success: true, game })    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// booking Open/Closed toggle 
export const bookingToggle = async (req, res) => {
  try {
    // find the latest game
    const latestGame = await gameDataModel.findOne().sort({ createdAt: -1 })

    if (!latestGame) {
      return res.status(404).json({ success: false, message: "No game found" });
    }
    latestGame.isBookingOpen = latestGame.isBookingOpen ? false : true;
    await latestGame.save();

    return res.status(200).json({ success: true, game: latestGame })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// payment toggle
export const paymentToggle = async (req, res) => {
  const playerID = req.body.playerID;
  try {
    const player = await ticketModel.findOne({playerID});

    if (!player) {
      return res.status(404).json({ success: false, message: "No player found" });
    }
    player.payment = player.payment ? false : true;
    await player.save();

    return res.status(200).json({ success: true, player })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
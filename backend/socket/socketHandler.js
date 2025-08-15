import { gameDataModel } from "../models/gameDataModel.js";
import { ticketModel } from "../models/ticketsModel.js";

let gameData = null;
let paidTickets = null;
let availableNumbers = [];
let calledNumbers = [];
let gameInterval = null;
let onlineCount = 0;

// Function to generate all numbers (1–90) in random order
function generateNumbers(excluded = []) {
  console.log(excluded, excluded.length); ///////////////
  
  
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  const remaining = numbers.filter(num => !excluded.includes(num));

  // Shuffle
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  availableNumbers = remaining;
  calledNumbers = [...excluded];
}




// Call the next number every X seconds
function startNumberCalling(io, gameID) {
  if (gameInterval) clearInterval(gameInterval);

  gameInterval = setInterval(async () => {
    // send game over if all the num are called
    if (availableNumbers.length === 0) {
      clearInterval(gameInterval);
      io.emit("game-over", { message: "All numbers called!" });
      return;
    }

    // send new number 
    const nextNumber = availableNumbers.shift();
    calledNumbers.push(nextNumber);
    await io.emit("new-number", nextNumber);
    
    
    // check new winner
    let pause = false
    const houseFullBatch = []
    const quickFiveBatch = []
    const firstLineBatch = []
    const secondLineBatch = []
    const thirdLineBatch = []

    const setBatch = []
    const halfSetBatch = []

    for (const player of paidTickets) {
      for (const ticket of player.tickets) {
        const withoutZeroField = ticket.data.filter(num => num);

        // check marked numbers
        const isHouseFull = withoutZeroField.every(element => calledNumbers.includes(element));
        const isQuickFive =  withoutZeroField.filter(element => calledNumbers.includes(element)).length == 5;
        const isFirstLine = withoutZeroField.slice(0, 5).every(element => calledNumbers.includes(element));
        const isSecondLine = withoutZeroField.slice(5, 10).every(element => calledNumbers.includes(element));
        const isThirdLine = withoutZeroField.slice(10, 15).every(element => calledNumbers.includes(element));
        
        // check limits and set into batch
        // houseFull
        if (isHouseFull && gameData.maxWinner.houseFull > gameData.winners.houseFull.length 
          && !gameData.winners.houseFull.some(win => win.players.some(p => p.ticket._id.equals(ticket._id)))
        ) {
          houseFullBatch.push({
            ticket: ticket,
            name: player.buyer.name,
            phone: player.buyer.phone,
            email: player.buyer.email,
            playerID: player.playerID
          })
        }

        // quickFive
        if (isQuickFive && gameData.maxWinner.quickFive > gameData.winners.quickFive.length 
          && !gameData.winners.quickFive.some(win => win.players.some(p => p.ticket._id.equals(ticket._id)))
        ) {
          quickFiveBatch.push({
            ticket: ticket,
            name: player.buyer.name,
            phone: player.buyer.phone,
            email: player.buyer.email,
            playerID: player.playerID
          })
        }

        // firstLine
        if (isFirstLine && gameData.maxWinner.firstLine > gameData.winners.firstLine.length 
          && !gameData.winners.firstLine.some(win => win.players.some(p => p.ticket._id.equals(ticket._id)))
        ) {
          firstLineBatch.push({
            ticket: ticket,
            name: player.buyer.name,
            phone: player.buyer.phone,
            email: player.buyer.email,
            playerID: player.playerID
          })
        }

        // secondLine
        if (isSecondLine && gameData.maxWinner.secondLine > gameData.winners.secondLine.length 
          && !gameData.winners.secondLine.some(win => win.players.some(p => p.ticket._id.equals(ticket._id)))
        ) {
          secondLineBatch.push({
            ticket: ticket,
            name: player.buyer.name,
            phone: player.buyer.phone,
            email: player.buyer.email,
            playerID: player.playerID
          })
        }

        // thirdLine
        if (isThirdLine && gameData.maxWinner.thirdLine > gameData.winners.thirdLine.length 
          && !gameData.winners.thirdLine.some(win => win.players.some(p => p.ticket._id.equals(ticket._id)))
        ) {
          thirdLineBatch.push({
            ticket: ticket,
            name: player.buyer.name,
            phone: player.buyer.phone,
            email: player.buyer.email,
            playerID: player.playerID
          })
        }

      }

      // check for set and half set winner
      if (player.tickets.length >= 3) {
        const booleanTickets = player.tickets.map(ticket => ticket.data.some(element => calledNumbers.includes(element)));
        const isSet = booleanTickets.every(element => element == true) && booleanTickets.length == 6;
        const checkHalfSet  = () => {
          let startingIndexForThreeTrue;
          let consecutiveCount = 0;
          for (let i = 0; i < booleanTickets.length; i++) {
            if (booleanTickets[i]) {
              startingIndexForThreeTrue = i-2
              consecutiveCount++
              if (consecutiveCount >= 3) return {isHalfSet: true, startingIndexForThreeTrue};
            } else {
              consecutiveCount = 0;
            }
          }
          return {isHalfSet: false, startingIndexForThreeTrue};
        }
        const { isHalfSet, startingIndexForThreeTrue } = checkHalfSet();

        if (isHalfSet && gameData.maxWinner.halfSet > gameData.winners.halfSet.length
          && !gameData.winners.halfSet.some(win => win.players.some(p => String(p.playerID) == String(player.playerID)))
        ) {
          player.tickets.slice(startingIndexForThreeTrue, startingIndexForThreeTrue+3)
          .forEach(ticket => {
            halfSetBatch.push({
              ticket: ticket,
              name: player.buyer.name,
              phone: player.buyer.phone,
              email: player.buyer.email,
              playerID: player.playerID
            })
          })
        }

        if (isSet && gameData.maxWinner.set > gameData.winners.set.length
          && !gameData.winners.set.some(win => win.players.some(p => String(p.playerID) == String(player.playerID)))
        ) {
          player.tickets.forEach(ticket => {
            setBatch.push({
              ticket: ticket,
              name: player.buyer.name,
              phone: player.buyer.phone,
              email: player.buyer.email,
              playerID: player.playerID
            })
          })
        }

      }

      
    };

    
    
    // if there is claim emit it and Save to DB
    if (
      houseFullBatch.length > 0 
      || firstLineBatch.length > 0 
      || quickFiveBatch.length > 0 
      || secondLineBatch.length > 0 
      || thirdLineBatch.length > 0
      || setBatch.length > 0
      || halfSetBatch.length > 0
    ) {
      const game = await gameDataModel.findById(gameID);

      pause = true;
      const claims = [];

      if (houseFullBatch.length > 0) {
        claims.push({ prizeType: "HouseFull", rank: game.winners.houseFull.length + 1, players: houseFullBatch, lastCall: nextNumber });
      }
      if (quickFiveBatch.length > 0) {
        claims.push({ prizeType: "Quick 5", rank: game.winners.quickFive.length + 1, players: quickFiveBatch, lastCall: nextNumber });
      }
      if (firstLineBatch.length > 0) {
        claims.push({ prizeType: "First Line", rank: game.winners.firstLine.length + 1, players: firstLineBatch, lastCall: nextNumber });
      }
      if (secondLineBatch.length > 0) {
        claims.push({ prizeType: "Second Line", rank: game.winners.secondLine.length + 1, players: secondLineBatch, lastCall: nextNumber });
      }
      if (thirdLineBatch.length > 0) {
        claims.push({ prizeType: "Third Line", rank: game.winners.thirdLine.length + 1, players: thirdLineBatch, lastCall: nextNumber });
      }

      if (setBatch.length > 0) {
        claims.push({ prizeType: "Set", rank: game.winners.set.length + 1, players: setBatch, lastCall: nextNumber });
      }
      if (halfSetBatch.length > 0) {
        claims.push({ prizeType: "Half Set", rank: game.winners.halfSet.length + 1, players: halfSetBatch, lastCall: nextNumber });
      }

      // Emit all claims together so the frontend never misses any
      io.emit("ticket-claimed", claims);


      // House Full
      if (houseFullBatch.length > 0) {
        game.winners.houseFull.push({
          prizeType: "HouseFull",
          rank: game.winners.houseFull.length + 1,
          lastCall: nextNumber,
          players: houseFullBatch
        });
      }

      // Quick 5
      if (quickFiveBatch.length > 0) {
        game.winners.quickFive.push({
          prizeType: "Quick 5",
          rank: game.winners.quickFive.length + 1,
          lastCall: nextNumber,
          players: quickFiveBatch
        });
      }

      // First Line
      if (firstLineBatch.length > 0) {
        game.winners.firstLine.push({
          prizeType: "First Line",
          rank: game.winners.firstLine.length + 1,
          lastCall: nextNumber,
          players: firstLineBatch
        });
      }

      // Second Line
      if (secondLineBatch.length > 0) {
        game.winners.secondLine.push({
          prizeType: "Second Line",
          rank: game.winners.secondLine.length + 1,
          lastCall: nextNumber,
          players: secondLineBatch
        });
      }

      // Third Line
      if (thirdLineBatch.length > 0) {
        game.winners.thirdLine.push({
          prizeType: "Third Line",
          rank: game.winners.thirdLine.length + 1,
          lastCall: nextNumber,
          players: thirdLineBatch
        });
      }

      // Set
      if (setBatch.length > 0) {
        game.winners.set.push({
          prizeType: "Set",
          rank: game.winners.set.length + 1,
          lastCall: nextNumber,
          players: setBatch
        });
      }

      // Set
      if (halfSetBatch.length > 0) {
        game.winners.halfSet.push({
          prizeType: "Half Set",
          rank: game.winners.halfSet.length + 1,
          lastCall: nextNumber,
          players: halfSetBatch
        });
      }

      // Add called number once
      game.callNum.push(nextNumber);
      gameData = game;
      await game.save();
    } else {
      await gameDataModel.findByIdAndUpdate(gameID, {
        $push: { callNum: nextNumber }
      });
    }

   

    // check is there any remaining prize to be claimed
    const maxWinnerCount = Object.values(gameData.maxWinner).reduce((sum, value) => sum + Number(value || 0), 0);
    const alreadyClaimed = Object.values(gameData.winners).reduce((sum, array) => sum + array.length, 0);
    // send game over
    if (maxWinnerCount <= alreadyClaimed) {
      clearInterval(gameInterval);
      await gameDataModel.findByIdAndUpdate(gameID, {
        $set: { gameStatus: "Game-Over" }
      });
      io.emit("game-over", { message: "Game over!" });
      return;
    }

    // pause if there is claim
    if (pause) {
      clearInterval(gameInterval);
      setTimeout(() => {
        startNumberCalling(io, gameID)
      }, 4000);
    }
  }, 4500);
}





export default function socketHandler(io) {
  io.on("connection", (socket) => {
    // number of online player
    onlineCount++;
    io.emit("online-count", { count: onlineCount });
    
    
    // Player joins the game
    socket.on("join-game", async () => {
      const latestGame = await gameDataModel.findOne().sort({ createdAt: -1 })
      
      socket.emit("online-count", { count: onlineCount });
      socket.emit("game-state", latestGame); // Send all past numbers & winners 
    });


    // Admin starts the game
    socket.on("start-game", async ({ gameID }, callback) => {

      const game = await gameDataModel.findById(gameID);
      if (game.gameStatus == "Preparation") {
        game.gameStatus = "Ongoing";
        await game.save()
      } else if (game.gameStatus == "Ongoing"){
        game.gameStatus = "Preparation";
        await game.save()
        // return callback({ error: "Game already started." });
        return callback()
      } else {
        return callback({ error: "Game Over." });
      }


      // set all the game data and tickets in a variable
      const tickets = await ticketModel.find({gameID, payment: true});
      paidTickets = tickets;
      gameData = game; 

      // generate the random list of number
      generateNumbers(game?.callNum || []);

      io.emit("game-started", { message: "Game has started!" });
      startNumberCalling(io, gameID);
      if (callback) callback(); // let frontend know we're done
    });


    // Player claims a win
    socket.on("claim-ticket", (data) => {
      console.log("🏁 Ticket claimed:", data);
      io.emit("ticket-claimed", data);
    });

    // disconnect user
    socket.on("disconnect", () => {
      onlineCount--;
      io.emit("online-count", { count: onlineCount });
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

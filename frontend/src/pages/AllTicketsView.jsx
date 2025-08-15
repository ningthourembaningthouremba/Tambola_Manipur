import React from 'react'
import { useState, useEffect } from 'react'
import Ticket from '../components/Ticket'
import Nav from '../components/Nav'

import { useGameDataStore } from "../store/gameDataStore.js"
import socket from "../socket";

const AllTicketsView = () => {
  const { viewGameData, gameData, players, isMuted } = useGameDataStore();


  // load the latest game data once
  useEffect(() => {
    const handleViewGameData = (_id) => {
      viewGameData(_id)
    }

    handleViewGameData("latest");
    
  }, [viewGameData])


  // socket 
  const [numbersCalled, setNumbersCalled] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState("0")
  const [winner, setWinner] = useState([])
  const [viewFilter, setViewFilter] = useState(true);


    // socket
  // Join game on page load
  useEffect(() => {
    socket.emit("join-game");
    

    socket.on("online-count", ({ count }) => {
      setOnlineCount(count)
    });

    socket.on("game-start", () => {
      speak("Get ready, players! The game has officially begun. Best of luck!", "male", 1);
    });

    // Listen for game state (past numbers, winners)
    socket.on("game-state", (game) => {
      if (game.gameStatus == "Game-Over") {
        setGameStatus("Game-Over")
      }
      setNumbersCalled(game.callNum || []);
      setCurrentNumber(game.callNum[game.callNum.length - 1]);
      const flatArray = Object.values(game.winners).flat();
      setWinner(flatArray)
    });

    // Listen for game start
    socket.on("game-started", (data) => {
      setMessages((prev) => [...prev, data.message]);
      console.log(data.message);
      
    });

    // Listen for new numbers
    socket.on("new-number", (number) => {
      setCurrentNumber(number);
      setNumbersCalled((prev) => [...prev, number]);
      if (!isMuted) {
        speakNumber(number, "female", 1)
      }
    });

    //  listen for new winner
    socket.on("ticket-claimed", (data) => {
      setWinner((prev) => [...prev, ...data])
      if (!isMuted) {
        speak(`Congratulations! We have ${data.length} new ${data.length > 1 ? "claims" : "claim"} for`, "male", 1)
        data.forEach(claim => {
          speak(`${claim.prizeType},`, "male", 1)
        });
      }
    });

    // game over 
    socket.on("game-over", () => {
      setGameStatus("Game-Over")
      speak("The game is over! Congratulations to all the winners. Thanks for playing Bingo Blast — until next time, keep the excitement alive!", "male", 1);
    });

    return () => {
      socket.off("game-over");
      socket.off("game-state");
      socket.off("game-started");
      socket.off("new-number");
      socket.off("ticket-claimed");
    };
  },[viewGameData, isMuted]);
  
  return (
    <>
      <Nav />

      <section>
        <div className='flex justify-around bg-slate-800 max-w-80 m-auto mt-5 rounded-md h-8'>
          <button onClick={() => setViewFilter(true)} className={`${viewFilter ? "bg-blue-400 text-black/90" : ""}  flex-1 rounded-[4px] cursor-pointer`}>Paid Tickets</button>
          <button onClick={() => setViewFilter(false)} className={`${!viewFilter ? "bg-blue-400 text-black/90" : ""}  flex-1 rounded-[4px] cursor-pointer`}>Unpaid Tickets</button>
        </div>

        {currentNumber && <p className='text-center bg-green-600 mt-3 font-medium text-[0.95rem]'>Last Call Number : {currentNumber}</p>}
      </section>

      <section className='grid grid-cols-4 gap-2 p-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1'>
        {players && players.map((player, index) => (
          player.payment==viewFilter && player.tickets.map((ticket, i) => (
            <Ticket key={i} tno={ticket.tno} data={ticket.data} name={player.buyer.name} called={numbersCalled}/>
          ))
        ))}
      </section>
    </>
  )
}

export default AllTicketsView
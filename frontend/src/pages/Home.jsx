import { useEffect, useState, useRef } from 'react'
import { Link } from "react-router-dom"
import socket from "../socket";

// stores
import { useTicketStore } from '../store/ticketStore.js'

import { useGameDataStore } from "../store/gameDataStore.js"

// components
import Ticket from '../components/Ticket'
import Nav from '../components/Nav'

// helper
import { speakNumber, speak, loadVoices } from "../extraJS/speech.js"
loadVoices();

const Home = () => {
  
  const { viewGameData, gameData, isMuted } = useGameDataStore();
  const { viewTickets, ticketsDetails, error } = useTicketStore();
  const [time, setTime] = useState("");
  const [gameStatus, setGameStatus] = useState("");
  const [playerIDInput, setPlayerIDInput] = useState("");
  const ticketDisplayRef = useRef(null);
  const [viewTicketsLoading, setViewTicketsLoading] = useState(false)

  // socket 
  const [numbersCalled, setNumbersCalled] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState("0")
  const [winner, setWinner] = useState([])


  // load the latest game data once
  useEffect(() => {
    const handleViewGameData = (_id) => {
      viewGameData(_id)
    }

    handleViewGameData("latest");
    
  }, [viewGameData])
  

  // countdown 
  useEffect(() => {
    let timerInterval;

    if (gameData?.startAt) {
      const targetTime = new Date(gameData.startAt).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
          setTime("00:00:00");
          clearInterval(timerInterval);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const format = (num) => String(num).padStart(2, "0");

        setTime(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
      };

      updateTimer(); // Initial call
      timerInterval = setInterval(updateTimer, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [gameData?.startAt]);


  // view tickets
  const handleViewTickets = async () => {
    try {
      setViewTicketsLoading(true)
      await viewTickets(playerIDInput);
      setViewTicketsLoading(false);

      // Auto scroll to ticket section after loading
      setTimeout(() => {
        if (ticketDisplayRef.current) {
          ticketDisplayRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      setViewTicketsLoading(false)
      console.log(error);
    }
  };


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
      <Nav isMuted={isMuted} muteFunc={() => setIsMuted(prev => !prev)} />

      {/* header */}
      <header className='py-25 px-3 max-sm:py-18'>
        <p className='bg-blue-500 w-34 text-center rounded-md text-[0.9rem] m-auto mb-2'>Online Players : {onlineCount}</p>
        <h1 className="text-3xl md:text-5xl font-bold max-md:font-black pb-2 bg-gradient-to-r from-blue-300 to-red-600 bg-clip-text text-transparent text-center max-w-120 w-[calc(100%-30px)] m-auto">
          Bingo Blast (Housie)
        </h1>
        <p className='text-center text-dark-text'>Where every number is a step closer to victory!</p>
        {gameData && time != "00:00:00" ?
          <div className='flex flex-col items-center'>
            <p className='flex justify-center items-baseline gap-2 m-auto my-3'>
              Next game starts in <span className='font-semibold text-2xl'>{time}</span>
            </p> 
            <Link to={"/booking"} className='bg-blue-400 rounded-[4px] px-2 translate-y-[-4px] text-[0.9rem] font-semibold text-slate-900'>
              Book now <i className="fa-solid fa-arrow-right text-[0.8rem]"></i>
            </Link>
          </div>
          : gameStatus != "Game-Over" 
          ? <p className='flex justify-center items-baseline gap-2 m-auto my-3 font-bold text-red-500 text-[1.3rem]'>Game is Live!</p>
          : <p className='flex justify-center text-center items-baseline gap-2 m-auto my-3 font-bold text-red-500 text-[1.3rem]'>Game is Over! <br></br> Next game will upload soon.</p>
        }
      </header>

      {/* search ticket using ID & whatsapp contact link */}
      {error && <p className='text-center mb-2 text-red-500'>{error}</p>}
      <section className='flex gap-2 max-w-130 w-[calc(100%-30px)] m-auto'>
        <div className='bg-slate-800 flex-1 h-12 p-2 flex items-center rounded-[40px] min-w-0'>
          <input className='flex-1 min-w-0 h-8 outline-0 px-2 pb-0.5' 
            type="text" 
            placeholder='Enter your ID'
            required
            id='playerID'
            onChange={(e) => setPlayerIDInput(e.target.value)}
          />
          <button onClick={handleViewTickets} className='bg-green-600 w-24 font-semibold p-1 px-1 text-[0.8rem] h-full rounded-[30px] cursor-pointer'>
            {viewTicketsLoading ? 
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
            : 
              "View-Tickets"
            }
          </button>
        </div>
        <Link to={"https://chat.whatsapp.com/ElfRSCcRvIlAtUpowSxU5M?mode=ac_t "} target='blank' className='bg-slate-700 h-12 w-12 rounded-full flex justify-center items-center aspect-square'>
          <i className="fa-brands fa-whatsapp text-2xl text-green-600"></i>
        </Link>
      </section>

      {/* number grid */}
      <div className="grid grid-cols-9 bg-slate-800 my-8 p-3 max-sm:p-2 gap-3 max-sm:gap-2 sm:py-10 overflow-x-scroll hide-scrollbar">
        {[...Array(90)].map((_, i) => (
          <div 
            className={`${i+1 === currentNumber ? 'bg-green-600' 
              : !numbersCalled.includes(i+1)
              ? 'border-2 border-slate-400 text-slate-400' 
              : "bg-slate-400 text-slate-900"
            } w-10 h-10 max-sm:w-7 max-sm:h-7 max-sm:text-[0.9rem] font-semibold flex justify-center items-center m-auto rounded-[12px] sm:rounded-2xl`}
            key={i+1} 
            style={{order: i % 10 * 9 + Math.floor(i / 10)}} 
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      <section className='bg-green-600 sticky top-0 py-2 px-4 text-center font-semibold mb-3'>
        <h1>Last call no. : {currentNumber ? currentNumber : "0"}</h1>
      </section>

      {ticketsDetails.tickets && 
        <div className='text-center text-[0.9rem] w-56 m-auto mb-3 flex justify-center gap-2'>
          {ticketsDetails.gameDetails.gameStatus == "Preparation" 
            ? <p className='bg-blue-500/15 text-blue-600 py-1 px-2'>Upcoming Tickets</p> 
            : ticketsDetails.gameDetails.gameStatus == "Ongoing" 
            ? <p className='bg-green-500/15 text-green-600 py-1 px-2'>Running Tickets</p> 
            : <p className='bg-red-500/15 text-red-600 py-1 px-2'>Expired Tickets!</p>
          }
          <div>
            {ticketsDetails.payment ? 
              <p className='bg-green-500/15 text-green-600 py-1 px-2'>Paid</p> 
              : <p className='bg-red-500/15 text-red-600 py-1 px-2'>Unpaid</p>
            }
          </div>
        </div>
      }
      <section id='ticketDisplay' ref={ticketDisplayRef} className='grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-2 w-[calc(100%-30px)] mb-10 m-auto'>
        {ticketsDetails.length <= 0 ? Array(4).fill("").map((_,index) => (
          <Ticket key={index} tno="Sample Ticket" data={[6, 0, 0, 33, 0, 0, 68, 71, 84, 0, 16, 0, 31, 46, 57, 0, 0, 83, 0, 0, 26, 0, 49, 52, 61, 0, 86]} called={[]}/>
        ))
        :
          ticketsDetails.tickets.map((ticket, index) => (
            <Ticket key={index} tno={ticket.tno} data={ticket.data} name={ticketsDetails.buyer.name} called={numbersCalled} />
          ))
        }
      </section>

      
      {/* winner board */}
      <section className='bg-slate-800 min-h-100 py-4 pb-40'>
        <h1 className='text-center text-[1.2rem] font-medium'>Winner Board</h1>
        <section className='flex flex-col gap-2 mt-4'>
          {winner.map((claim, index) => (
            <div key={index} className='w-[calc(100%-30px)] m-auto p-2 max-w-250 bg-slate-700 rounded-md'>
              {/* winner type */}
              <div className='flex justify-between text-green-500 font-medium mb-1'>
                <h4>{claim.prizeType}-{claim.rank}</h4>
                <h4 className='bg-slate-800 text-[0.8rem] px-2 py-1 w-24 text-center'>Last Call: {claim.lastCall}</h4>
              </div>
              {/* winner details */}
              {claim.players.map((player, i) => (
                <div key={i} className='flex items-center justify-between gap-2 text-[0.9rem]'>
                  <div>
                    <p className='font-medium'>{player.name}</p>
                    <p className='text-[0.8rem] text-white/60'>{player.playerID}</p>
                  </div>
                  <p className='bg-slate-800 w-24 py-1 text-[0.8rem] text-center'>T.no: {player.ticket.tno}</p>
                </div>
              ))}
            </div>
          ))}

        </section>
      </section>
    </>
  )
}

export default Home


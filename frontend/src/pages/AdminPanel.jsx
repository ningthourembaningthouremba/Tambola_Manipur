import React from 'react'
import { useAuthStore } from "../store/authStore.js"
import { useGameDataStore } from "../store/gameDataStore.js"
import GameUploadForm from "../components/GameUploadForm.jsx"
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import socket from "../socket";
import LoadingAnimation from "../components/LoadingAnimation.jsx"
import Nav from "../components/Nav.jsx"

import { PaymentRequestTemplate } from "../extraJS/whatsappAPI.js"


const AdminPanel = () => {

  const { logout } = useAuthStore();
  const { uploadNewGame, viewGameData, bookingToggle, paymentToggle, gameData, players, error, isLoading } = useGameDataStore();

  const formattedDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", 
      day: "2-digit",
      month: "short",  // use "long" for full month name
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  // get the updated game data when redirect to this page
  useEffect(() => {
    const handleViewGameData = async (_id) => {
      await viewGameData(_id)
    }
    handleViewGameData("latest");
    
  }, [viewGameData])


  const [updatingBookingStatus, setUpdatingBookingStatus] = useState(false);
  const handleBookingToggle = async () => {
    setUpdatingBookingStatus(true)
    await bookingToggle()
    setUpdatingBookingStatus(false)
  }

  

  // upload game popup form
  const [uploadFormShow, setUploadFormShow] = useState(false);
  const formFields = [
    { label: "Start Time", name: "startAt", type: "datetime-local" },
    { label: "HouseFull", name: "houseFull", type: "number" },
    { label: "Set", name: "set", type: "number" },
    { label: "Half Set", name: "halfSet", type: "number" },
    { label: "Quick Five", name: "quickFive", type: "number" },
    { label: "First Line", name: "firstLine", type: "number" },
    { label: "Second Line", name: "secondLine", type: "number" },
    { label: "Third Line", name: "thirdLine", type: "number" },
  ];

  const [allPlayers, setAllPlayers] = useState([])
  const [paidPlayers, setPaidPlayers] = useState([])
  const [unpaidPlayers, setUnpaidPlayers] = useState([])
  const [totalPaidTickets, setTotalPaidTickets] = useState(0);
  const [totalUnpaidTickets, setTotalUnpaidTickets] = useState(0);
  

  useEffect(() => {
    setAllPlayers(players)
    const paid = players.filter(doc => doc.payment);
    const unpaid = players.filter(doc => !doc.payment);

    setPaidPlayers(paid)
    setUnpaidPlayers(unpaid)

    setTotalPaidTickets(paid.reduce((acc, player) => acc + player.tickets.length, 0));
    setTotalUnpaidTickets(unpaid.reduce((acc, player) => acc + player.tickets.length, 0));
    
  }, [players, viewGameData,])

  const [updatingPlayerId, setUpdatingPlayerId] = useState(null);

  const handlePaymentToggle = async (playerID) => {
    setUpdatingPlayerId(playerID);
    await paymentToggle(playerID);
    await viewGameData("latest");

    setUpdatingPlayerId(null);   
  }


  // game start 
  const [startGameLoading, setStartGameLoading] = useState(false);
  const startGame = (gameID) => {
    setStartGameLoading(true);
    socket.emit("start-game", { gameID }, (res) => {
      if (res?.error) {
        alert(res.error);
        setStartGameLoading(false);
        return;
      }
      viewGameData("latest").finally(() => {
        setStartGameLoading(false);
      });
    });
  }
  
  
  return (
    <section>
      <Nav />

      <nav className='m-auto flex justify-center gap-2 my-5 mx-3 flex-wrap'>
        <button onClick={() => setUploadFormShow(true)} className='bg-blue-500 px-2 py-1 rounded-md text-[0.9rem]'>Upload Game</button>
        <button className='bg-blue-500 px-2 py-1 rounded-md text-[0.9rem]'>Game Modify</button>
        {gameData && 
          <button onClick={handleBookingToggle} className={`${gameData.isBookingOpen ? "bg-green-500" : "bg-red-500"} px-2 py-1 w-30 rounded-md text-[0.9rem]`}>
            {updatingBookingStatus ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
            ) : (
              gameData.isBookingOpen ? "Booking Open" : "Booking Closed"
            )}
          </button>
        }
        <button className='bg-blue-500 px-2 py-1 rounded-md text-[0.9rem]'>Game History</button>
        <button className='bg-green-500 px-2 py-1 rounded-md text-[0.9rem]'>Profile</button>
        <button onClick={() => logout()} className='bg-red-500 px-2 py-1 rounded-md text-[0.9rem]'>Logout</button>
      </nav>


      { uploadFormShow && (
        <GameUploadForm 
          visible={uploadFormShow} 
          fields={formFields} 
          onClose={() => setUploadFormShow(false)} 
          onSubmit={(data) => uploadNewGame(data)} 
          isLoading={isLoading} 
        />
      )}

      {/* user management + ticket management*/}
      <section>
        {/* Coming Game Status */}
        {isLoading && <p className='absolute left-[50%] top-30 translate-x-[-50%]'>Loading...</p>}
        {gameData && <div className='max-w-7xl my-4 pb-4 m-auto w-[calc(100%-30px)] text-[0.9rem] grid sm:grid-cols-2 grid-cols-1 gap-2 border-b-2 border-slate-600'>
          <h1><span className='font-medium text-blue-500'>Coming Game Status :</span> {gameData.gameStatus}</h1>

          <h1><span className='font-medium text-blue-500'>Game ID: </span>{gameData._id}</h1>
          <h1>
            <span className='font-medium text-blue-500'>Start Time: </span>
            {formattedDateTime(gameData.startAt)}
          </h1>
          <h1><span className='font-medium text-blue-500'>Booking: </span>{gameData.isBookingOpen ? "Open" : "Closed"}</h1>
          
          <div className='flex gap-3 flex-nowrap'>
            <span className='font-medium text-blue-500'>Players: </span>
            <p>
              <span className='bg-green-500/15 text-green-600 px-2 py-1 w-14 text-center rounded-md mr-2'>{paidPlayers.length} Paid</span>
              +
              <span className='bg-red-500/15 text-red-600 px-2 py-1 w-14 text-center rounded-md ml-2'>{unpaidPlayers.length} Unpaid</span> = {allPlayers.length}
            </p>
          </div>

          <div className='flex gap-3 flex-nowrap'>
            <span className='font-medium text-blue-500'>Tickets: </span>
            <p>
              <span className='bg-green-500/15 text-green-600 px-2 py-1 w-14 text-center rounded-md mr-2'>{totalPaidTickets} Paid</span>
              +
              <span className='bg-red-500/15 text-red-600 px-2 py-1 w-14 text-center rounded-md ml-2'>{totalUnpaidTickets} Unpaid</span> = {totalPaidTickets+totalUnpaidTickets}
            </p>
          </div>


          <div>
            <h1 className='font-medium'>Winner Count :</h1>
            <h1><span className='font-medium text-blue-500'>HouseFull: </span>{gameData.maxWinner.houseFull}</h1>
            <h1><span className='font-medium text-blue-500'>Set: </span>{gameData.maxWinner.set}</h1>
            <h1><span className='font-medium text-blue-500'>Half Set: </span>{gameData.maxWinner.halfSet}</h1>
            <h1><span className='font-medium text-blue-500'>Quick 5: </span>{gameData.maxWinner.quickFive}</h1>
            <h1><span className='font-medium text-blue-500'>First Line: </span>{gameData.maxWinner.firstLine}</h1>
            <h1><span className='font-medium text-blue-500'>Second Line: </span>{gameData.maxWinner.secondLine}</h1>
            <h1><span className='font-medium text-blue-500'>Third Line: </span>{gameData.maxWinner.thirdLine}</h1>
          </div>

          {gameData && 
            <button onClick={() => startGame(gameData._id)} className={`${gameData.gameStatus == "Preparation"  ? "bg-green-500" : gameData.gameStatus == "Ongoing"  ? "bg-red-500" : "bg-slate-500" } px-2 w-30 h-8 rounded-md text-[0.9rem]`}>
              {startGameLoading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
              ) : (
                gameData.gameStatus == "Preparation" 
                  ? "Start" 
                  : gameData.gameStatus == "Ongoing" 
                  ? "Live"
                  : "Game Over"
              )}
            </button>
          }

        </div>}


        {/* Filter for Player Management */}
        <div className='grid grid-cols-1 gap-2 max-w-lg m-auto w-[calc(100%-30px)]'>
          <input className='bg-slate-800 py-2 px-3 rounded-md'
            placeholder='Search by Player ID'
            type="text"  
          />
          <input className='bg-slate-800 py-2 px-3 rounded-md'
            placeholder='Search by phone number'
            type="text"  
          />
          <div className='flex gap-2'>
            <select id="payment" name="payment" className='bg-slate-800 rounded-md px-3 py-2 flex-1 outline-none'>
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>

            <button className='bg-blue-500 px-4 py-1 rounded-md text-[0.9rem]'>Search</button>
          </div>
        </div>

        {/* Player Management Table */}
        <h1 className='max-w-7xl mt-4 m-auto w-[calc(100%-30px)] font-medium'>Player Management :</h1>
        <div className='overflow-x-auto scrollbar-hide my-4'>
          <table className='max-w-7xl m-auto w-[calc(100%-30px)] border-spacing-2'>
            <thead className='bg-blue-500 text-slate-900 font-medium'>
              <tr className='text-[0.9rem]'>
                <td className='py-2 pl-2'>Name</td>
                <td className='py-2 pl-2'>Ticket</td>
                <td className='py-2 pl-2'>Status</td>
                <td className='py-2 pl-2 max-w-30'>Time</td>
                <td className='py-2 pl-2 max-w-20'>Contact</td>
              </tr>
            </thead>

            <tbody>
              {allPlayers.map((player, index) => (
                <tr key={index} className='text-[0.8rem] border-b border-slate-700'>
                  <td className='py-2 pl-2'>
                    <p>{player.buyer.name}</p>
                    <p className='text-[0.7rem]'>{player.playerID}</p>
                  </td>
                  <td className='py-2 pl-2'>
                    {player.tickets.length == 1 ? player.tickets[0].tno : player.tickets[0].tno + "-" + player.tickets[player.tickets.length-1].tno} <span className='text-blue-500'>(</span>
                    {player.tickets.length}<span className='text-blue-500'>)</span>
                  </td>
                  <td className='py-2 pl-2'>
                    <button onClick={() => handlePaymentToggle(player.playerID)} className={`${player.payment ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"} p-2 w-14 text-center rounded-md`}>
                      {updatingPlayerId === player.playerID ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                      ) : (
                        player.payment ? "Paid" : "Unpaid"
                      )}
                    </button>
                  </td>
                  <td className='py-2 pl-2 max-w-30'>
                    <p>{formattedDateTime(player.createdAt).split(", ")[0]}</p>
                    <p className='text-[0.7rem]'>{formattedDateTime(player.createdAt).split(", ")[1]}</p>
                  </td>
                  <td className='py-2 pl-2 max-w-20'>
                    <Link className='bg-red-600'
                      to={`https://wa.me/91${player.buyer.phone}?text=${encodeURIComponent(PaymentRequestTemplate(player))}`}
                    >
                      <p>{player.buyer.phone}</p>
                      <p className='text-[0.7rem]'>{player.buyer.email}</p>
                    </Link>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

      </section>
    </section>
  )
}

export default AdminPanel
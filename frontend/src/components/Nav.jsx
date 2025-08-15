import React from 'react'
import { Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore";
import { useGameDataStore } from "../store/gameDataStore.js"

const Nav = () => {

  const { muteToggle, isMuted } = useGameDataStore();

  const { isAuthenticated, user } = useAuthStore(); // check user ? admin / to show admin panel btn
  return (
    <nav className='bg-slate-800 flex justify-between items-center px-1 h-10 mt-3 mx-3 rounded-[10px] text-[0.85rem] text-white/90'>
      <button onClick={muteToggle} className={`${isMuted ? "bg-gray-700" : "bg-blue-400 text-black/70"} px-2 py-1.5 rounded-[6px]`}>
        {!isMuted ? <i className="fa-solid fa-volume-high"></i> : <i className="fa-solid fa-volume-xmark"></i>}
      </button>
      <div className='flex gap-3 text mx-2'>
        <Link to={"/"}>Home</Link>
        <Link to={"/view_all_tickets"}>Tickets</Link>
        <Link to={"/view_all_players"}>Players</Link>
      </div>

      {isAuthenticated && user.role == "admin" && <Link to={"/adminPanel"} className='bg-blue-400 px-2 py-1.5 rounded-[6px] text-center text-black'>Admin</Link>}
    </nav>
  )
}

export default Nav
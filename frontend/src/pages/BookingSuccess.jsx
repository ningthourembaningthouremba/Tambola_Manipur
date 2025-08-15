import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Ticket from '../components/Ticket';

const API_URL = import.meta.env.VITE_NODE_ENV == "development" 
? "http://localhost:5000" 
: import.meta.env.VITE_API_URL;


axios.defaults.withCredentials = true;

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const playerID = searchParams.get("playerID");

  const [bookingData, setBookingData] = useState({
    playerID: "453278",
    name: "453278",
    phone: "453278",
    email: "453278",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/ticket/view?playerID=${playerID}`);
        setBookingData(response.data.ticketsDetails);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    if (playerID) fetchBookingData();
    else {
      setError("Invalid Player ID");
      setLoading(false);
    }
  }, [playerID]);


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

  if (loading) return <div className="text-center my-10">Loading booking details...</div>;
  if (error) return <div className="text-red-500 text-center my-10">{error}</div>;

  return (
    <div className="p-4 max-w-lg m-auto">
      <Link to={"/"} className='bg-blue-500 text-slate-900 text-[0.9rem] px-2 py-1 rounded-md'><i className="fa-solid fa-arrow-left"></i> Back To Home</Link>
      <h1 className="text-2xl font-bold text-green-600 mb-4 mt-10 text-center">Booking Successful!</h1>
      <p><strong className='text-dark-text'>Game ID :</strong> {bookingData.gameID}</p>
      <p><strong className='text-dark-text'>Player ID :</strong> {bookingData.playerID}</p>
      <p><strong className='text-dark-text'>Booking Time :</strong> {formattedDateTime(bookingData.createdAt)}</p>
      <p><strong className='text-dark-text'>Payment :</strong> {bookingData.payment ? "Paid" : "Unpaid"}</p>

      <div className="mt-6">
        <h2 className="text-[1.2rem] font-semibold mb-2">Tickets:</h2>
        <div className="grid grid-cols-1 gap-4">
          {bookingData.tickets?.map((ticket, index) => (
            <Ticket key={index} tno={ticket.tno} data={ticket.data} name={bookingData.buyer.name} called={[]}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

import { generateTicket } from "./generateTicket.js"
import { ticketModel } from "../models/ticketsModel.js";
import { bookingSuccess } from "../email/bookingSuccess.js"
import { sendEmail } from "../email/sendEmail.js"
import { gameDataModel } from "../models/gameDataModel.js";




// view ticket & hidder admin login **************************
export const viewTicket = async (req, res) => {
  const playerID = req.query.playerID;
  if (!playerID) {
    res.status(400).json({ success: false, message: "Please enter your player ID" })
  }
  try {
    const ticketDetails = await ticketModel.findOne({ playerID });
    if (!ticketDetails) {
      res.status(404).json({ success: false, message: "Wrong player ID." }) 
    }

    // Fetch game details using the gameID from ticket
    const gameDetails = await gameDataModel.findById(ticketDetails.gameID).lean();

    if (!gameDetails) {
      return res.status(404).json({ success: false, message: "Game not found." });
    }

    const { phone, email, ...buyerWithoutSensitiveInfo } = ticketDetails.buyer || {};
    res.status(200).json({ 
      success: true,
      ticketsDetails: {...ticketDetails._doc, buyer: buyerWithoutSensitiveInfo, gameDetails}
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}


// generate tickets before booking
export const genarateTicketBeforeBooking = async (req, res) => {
  const numOfTickets = req.query.numOfTickets;
  try {
    if (!numOfTickets || numOfTickets > 6 || numOfTickets <= 0) {
      res.status(400).json({ success: false, message: "Cannot generate more than 6 tickets at once." })
    }
    
    const greneratedTickets = generateTicket(numOfTickets);
    const formatedTickets = [];

    greneratedTickets.forEach(ticket => {
      const objFormTicket = { tno : '', data : ticket }
      formatedTickets.push(objFormTicket);
    })
      
    res.status(200).json({ success: true, tickets: formatedTickets, message: `${numOfTickets} tickets are generated` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}


// booking tickets
export const bookingTickets = async (req, res) => {

  try {
    // 1. Validate required fields
    if (!req.body.gameID || !req.body.name || !req.body.phone || !req.body.tickets) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Transform frontend data to match schema
    const transformedData = {
      gameID: req.body.gameID,
      buyer: {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email || undefined
      },
      tickets: req.body.tickets.map(ticketData => ({
        data: Array.isArray(ticketData) ? ticketData : [ticketData]
      }))
    };

    // 3. Create and save ticket
    const newTicket = new ticketModel(transformedData);
    await newTicket.save();

    // 4. send mail
    if (req.body.email) {
      const gameBookingFor = await gameDataModel.findOne({ _id : req.body.gameID });
      const bookingSuccessHtml = bookingSuccess(
        req.body.name,
        gameBookingFor.startAt,
        newTicket.playerID,
        newTicket.tickets.length > 1 ? `${newTicket.tickets[0].tno} to ${newTicket.tickets[newTicket.tickets.length-1].tno}` : newTicket.tickets[0].tno
      );
  
      sendEmail(req.body.email, "Ticket Booking Success", bookingSuccessHtml);
    }


    // 5. Return success response (excluding sensitive data if needed)
    const responseData = {
      _id: newTicket._id,
      playerID: newTicket.playerID,
      gameID: newTicket.gameID,
      tickets: newTicket.tickets,
      success: true
    };

    res.status(201).json(responseData);

    // res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
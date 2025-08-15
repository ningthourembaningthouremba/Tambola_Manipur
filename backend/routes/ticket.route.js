import express from  "express";
import { 
  viewTicket, 
  genarateTicketBeforeBooking, 
  bookingTickets 
} from "../controllers/ticket.controller.js";
const router = express.Router();

router.get("/view", viewTicket)
router.get("/generate", genarateTicketBeforeBooking)
router.post("/booking", bookingTickets)


export default router;
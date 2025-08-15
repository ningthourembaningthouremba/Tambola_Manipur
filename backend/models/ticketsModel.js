import mongoose from "mongoose";

const ticketInfoSchema = new mongoose.Schema({
  tno: { type: Number, unique: true },
  data: { type: Array, required: true },
});

const ticketSchema = new mongoose.Schema(
  {
    gameID : { type: mongoose.Schema.Types.ObjectId, ref: "gameData", required: true },
    playerID : { type: String, unique: true },
    payment : { type: Boolean, default: false },
    buyer : {
      name: { type: String, require: true },
      phone: { type: Number, require: true },
      email: { type: String }
    },
    tickets : { type: [ticketInfoSchema], required: true }
  },
  { timestamps: true }
)

ticketSchema.pre('save', async function(next) {
  if (!this.isNew) return next();

  try {
    // Generate playerID (unchanged)
    let playerID;
    let isUnique = false;
    while (!isUnique) {
      playerID = Math.floor(100000 + Math.random() * 900000).toString();
      const existingTicket = await this.constructor.findOne({ playerID });
      if (!existingTicket) isUnique = true;
    }
    this.playerID = playerID;

    // Modified ticket number assignment (allows duplicates)
    const lastTicket = await this.constructor.findOne({}, {}, { sort: { 'tickets.tno': -1 } });
    
    const baseTno = lastTicket?.tickets?.[lastTicket.tickets.length-1]?.tno || 0;
    
    this.tickets.forEach((ticket, index) => {
      ticket.tno = baseTno + index + 1; // Simple increment regardless of content
    });

    next();
  } catch (err) {
    next(err);
  }
});











// // Auto-increment tno before saving
// ticketSchema.pre('save', async function(next) {
//   if (!this.isNew) return next(); // Only run on new documents

//   try {
//     // Find the last ticket and get its tno
//     const lastTicket = await this.constructor.findOne({}, {}, { sort: { 'tickets.tno': -1 } });
    
//     // Set the new tno (lastTicket.tickets[0].tno + 1 or 1 if no tickets exist)
//     const newTno = lastTicket?.tickets?.[0]?.tno ? lastTicket.tickets[0].tno + 1 : 1;
    
//     // Apply to all tickets in the array (if multiple tickets are inserted at once)
//     this.tickets.forEach(ticket => {
//       if (!ticket.tno) ticket.tno = newTno;
//     });

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

export const ticketModel = mongoose.model("tickets", ticketSchema);
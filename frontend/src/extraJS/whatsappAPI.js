
export const PaymentRequestTemplate = (player) => {

  return (
  `*Hi, ${player.buyer.name}!*
  _Your booking was successful._
  *Your ID :* ${player.playerID}
  *Ticket :* ${
      player.tickets.length == 1
        ? player.tickets[0].tno
        : player.tickets[0].tno + "-" + player.tickets[player.tickets.length - 1].tno
    } (${player.tickets.length})
    
  Please pay to the below Qr Code to confirm booking.
  Thank you!
  
  Regards,
  BingoBlast`
  )
}

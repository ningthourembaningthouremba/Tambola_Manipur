export function bookingSuccess(name, date, playerID, tno) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Tambola Game Ticket Booking Confirmation!</h2>
      <p>Dear ${name},</p>
      <p>We're thrilled to confirm that your ticket booking for the Tambola game has been successful!</p>
      <h3>Ticket Details</h3>
      <ul>
        <li>Game Name: Bingo Blast</li>
        <li>Date-time: ${date}</li>
        <li>Player ID: ${playerID}</li>
        <li>Ticket Number: ${tno}</li>
      </ul>
      <h3>Next Steps</h3>
      <p>To secure your spot, please make the payment before the game starts. Contact admin to pay. Simply follow the instructions to complete the payment.</p>
      <p><strong>Important Reminder:</strong> If the payment is not made before the game starts, your ticket booking will be cancelled.</p>
      <p>Get Ready for Fun! We're looking forward to seeing you at the Tambola game! If you have any questions or concerns, feel free to reach out to us.</p>
      <p>Best regards,<br>Bingo Blast Entertainment</p>
      <p>P.S. Don't forget to pay for your ticket before the game starts to avoid cancellation!</p>
    </div>
  `;
};
import sendMail from '../utils/email'


exports.sendBookingConfirmation=async(user,booking)=>{
    const message = `Dear ${user.name},\n\nYour booking for the tour 
    ${booking.tour.name} has been confirmed. Thank you for choosing us!
    \n\nBest regards,\nYour Company`;
    await sendMail({
        to: user.email,
        subject: 'Your booking confirmation',
        text: message,
    });
}
exports.sendBookingCancellation=async(user,booking)=>{
    const message = `Dear ${user.name},\n\nYour booking for the tour 
    ${booking.tour.name} has been cancelled. We are sorry for the inconvenience.
    \n\nBest regards,\nYour Company`;
    await sendMail({
        to: user.email,
        subject: 'Your booking cancellation',
        text: message,
    });
}
exports.sendPaymentReceipt=async(user,booking)=>{
    const message= `Dear ${user.name},\n\nYour payment for the tour
    ${booking.tour.name} has been received. You can view your receipt
    here: ${receiptUrl}\n\nBest regards,\nYour Company`;
    await sendMail({
        email: user.email,
        subject: 'Payment Receipt',
        message,
    })
}
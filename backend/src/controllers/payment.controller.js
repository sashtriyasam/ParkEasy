const razorpayService = require('../services/payment.service');
const bookingService = require('../services/booking.service');
const prisma = require('../config/db');
const logger = require('../utils/logger');

/**
 * Create a Razorpay order for a booking (Ticket)
 */
exports.createOrder = async (req, res) => {
    try {
        const { amount, facility_id, slot_id } = req.body;

        if (!amount || amount <= 0 || amount > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount. Must be between 1 and 5000.'
            });
        }

        // Create order in Razorpay
        const order = await razorpayService.createPaymentOrder(amount, 'INR', {
            facility_id,
            slot_id,
            customer_id: req.user.id
        });

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        logger.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
        });
    }
};

/**
 * Verify Razorpay payment signature
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            slot_id,
            vehicle_number,
            vehicle_type 
        } = req.body;

        const isValid = razorpayService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Phase 7A: Confirm booking via service
        const ticket = await bookingService.confirmBooking(
            slot_id, 
            req.user.id, 
            vehicle_number, 
            vehicle_type
        );

        // Update ticket with payment details
        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                payment_id: razorpay_payment_id,
                payment_status: 'PAID',
                payment_method: 'CARD' // or 'UPI' depending on selection, defaulting to CARD/Razorpay
            }
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified and booking confirmed',
            data: updatedTicket
        });
    } catch (error) {
        logger.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
};

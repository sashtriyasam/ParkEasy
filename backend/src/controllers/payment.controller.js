const razorpayService = require('../services/payment.service');
const prisma = require('../config/db');
const logger = require('../utils/logger');
const { emitSlotUpdate } = require('../services/socket.service');

/**
 * Create a Razorpay order for a booking (Ticket)
 */
exports.createOrder = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and amount are required'
            });
        }

        // Validate ticket exists and belongs to user
        const ticket = await prisma.ticket.findUnique({
            where: { id: bookingId }
        });

        if (!ticket || ticket.customer_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Create order in Razorpay
        const order = await razorpayService.createPaymentOrder(amount, 'INR', {
            bookingId,
            customerId: req.user.id
        });

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency
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
            bookingId 
        } = req.body;

        const isValid = razorpayService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update ticket status and slot status within a transaction
        const result = await prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.update({
                where: { id: bookingId },
                data: {
                    status: 'ACTIVE',
                    payment_status: 'PAID',
                    payment_id: razorpay_payment_id,
                    payment_method: 'RAZORPAY'
                },
                include: {
                    slot: true
                }
            });

            // Update associated slot to OCCUPIED
            await tx.parkingSlot.update({
                where: { id: ticket.slot_id },
                data: { 
                    status: 'OCCUPIED',
                    reservation_expiry: null
                }
            });

            return ticket;
        });

        // Trigger socket update for real-time occupancy
        emitSlotUpdate(result.facility_id, {
            slotId: result.slot_id,
            status: 'OCCUPIED'
        });

        const { sendPushNotification } = require('../utils/pushNotifications');

        // Send push notification to user
        if (req.user.push_token) {
            sendPushNotification(
                req.user.push_token,
                'Payment Received!',
                `Payment verified for booking at ${result.slot.floor.facility.name}. Your spot is ready.`,
                { ticketId: result.id, status: 'PAID' }
            ).catch(err => logger.error('Push Notification Error:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: result
        });
    } catch (error) {
        logger.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
};

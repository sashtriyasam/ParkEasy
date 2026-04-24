const razorpayService = require('../services/payment.service');
const bookingService = require('../services/booking.service');
const prisma = require('../config/db');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Helper: check Razorpay is configured correctly (not using demo placeholders)
 */
const isPaymentConfigured = () => {
    return (
        process.env.RAZORPAY_KEY_ID && 
        process.env.RAZORPAY_KEY_SECRET && 
        process.env.RAZORPAY_KEY_ID !== 'rzp_test_demo' &&
        process.env.RAZORPAY_KEY_SECRET !== 'rzp_secret_demo'
    );
};

const PAYMENT_CONFIG_ERROR = {
    success: false,
    message: 'Payment service is not configured. Please contact support.'
};

/**
 * Create a Razorpay order for a booking (Ticket)
 */
exports.createOrder = async (req, res) => {
    if (!isPaymentConfigured()) {
        return res.status(503).json(PAYMENT_CONFIG_ERROR);
    }
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
    if (!isPaymentConfigured()) {
        return res.status(503).json(PAYMENT_CONFIG_ERROR);
    }
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

        // 1. Fetch actual payment method from Razorpay (best-effort; falls back in mock/test mode)
        // Perform this OUTSIDE the DB transaction to avoid blocking connections with network latency.
        const razorpayPayment = await razorpayService.fetchPaymentDetails(razorpay_payment_id);
        const paymentMethod = razorpayPayment?.method || 'unknown';

        // 2. Atomic Financial & Booking Update
        const updatedTicket = await prisma.$transaction(async (tx) => {
            // A. Confirm booking via service (Now transactional)
            // This updates slot status to OCCUPIED and sets ticket status to ACTIVE
            const ticket = await bookingService.confirmBooking(
                slot_id, 
                req.user.id, 
                vehicle_number, 
                vehicle_type,
                tx
            );

            // B. Get facility and provider info
            const facility = await tx.parkingFacility.findUnique({
                where: { id: ticket.facility_id },
                select: { provider_id: true, name: true }
            });

            if (!facility) {
                throw new AppError('Facility not found for ticket', 404);
            }

            if (!facility.provider_id) {
                throw new AppError('Facility missing provider_id for ticket', 400);
            }

            // C. Calculate Fees (10% Platform Fee)
            // SECURITY: Use the server-authoritative total_fee from the ticket record.
            const totalAmount = parseFloat(ticket.total_fee ?? 0);
            if (!totalAmount || totalAmount <= 0) {
                throw new AppError(
                    `Cannot settle payment: ticket ${ticket.id} has no valid total_fee (got: ${ticket.total_fee}).`,
                    400
                );
            }
            const platformFee = totalAmount * 0.10;
            const netAmount = totalAmount - platformFee;

            // D. Update ticket with payment details
            const t = await tx.ticket.update({
                where: { id: ticket.id },
                data: {
                    payment_id: razorpay_payment_id,
                    payment_status: 'PAID',
                    payment_method: paymentMethod
                }
            });

            // E. Credit Provider Balance
            await tx.user.update({
                where: { id: facility.provider_id },
                data: {
                    balance: { increment: netAmount }
                }
            });

            // F. Log Platform Transaction
            await tx.platformTransaction.create({
                data: {
                    ticket_id: ticket.id,
                    amount: totalAmount,
                    platform_fee: platformFee,
                    net_amount: netAmount,
                    type: 'TRANSACTION'
                }
            });

            return t;
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified and earnings settled',
            data: {
                ticket: updatedTicket,
                settlement: {
                    total: totalAmount,
                    platform_fee: platformFee,
                    net_credited: netAmount
                }
            }
        });
    } catch (error) {
        logger.error('Error verifying payment:', error);
        
        const statusCode = error.statusCode || 500;
        const message = error.isOperational 
            ? error.message 
            : 'Internal server error during verification';

        res.status(statusCode).json({
            success: false,
            message
        });
    }
};

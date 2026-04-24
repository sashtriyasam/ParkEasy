const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');
const MOCK_KEY_ID = 'rzp_test_demo';
const MOCK_KEY_SECRET = 'demo_secret';

/**
 * Helper: check if we are in Mock Payment mode
 */
const isMockMode = () => {
    return !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === MOCK_KEY_ID;
};

// Initialize Razorpay with lazy initialization pattern to prevent crash on startup
let razorpay = null;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || MOCK_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET || MOCK_KEY_SECRET,
    });
} catch (error) {
    logger.warn('Razorpay initialization failed. Payment features may not work:', error.message);
}

/**
 * Create a payment order
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code (default: INR)
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Razorpay order object
 */
async function createPaymentOrder(amount, currency = 'INR', metadata = {}) {
    // Phase 12: Centralized Mock Mode Check
    if (isMockMode()) {
        logger.info('Using Mock Payment Order (missing or test Razorpay keys)');
        return {
            id: `order_mock_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency,
            status: 'created',
            notes: metadata
        };
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: metadata,
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        logger.error('Error creating payment order:', error);
        throw new Error('Failed to create payment order');
    }
}

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
    try {
        const text = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
            .update(text)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        logger.error('Error verifying payment signature:', error);
        return false;
    }
}

/**
 * Process card payment (demo implementation)
 * @param {Object} cardDetails - Card payment details
 * @param {number} amount - Amount to charge
 * @returns {Promise<Object>} Payment result
 */
async function processCardPayment(cardDetails, amount) {
    // In production, this would integrate with Razorpay/Stripe
    // For now, we'll simulate a successful payment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                paymentId: `pay_${Date.now()}`,
                amount,
                method: 'CARD',
                status: 'captured',
            });
        }, 1000);
    });
}

/**
 * Process UPI payment (demo implementation)
 * @param {string} upiId - UPI ID
 * @param {number} amount - Amount to charge
 * @returns {Promise<Object>} Payment result
 */
async function processUPIPayment(upiId, amount) {
    // In production, this would integrate with UPI gateway
    // For now, we'll simulate a successful payment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                paymentId: `upi_${Date.now()}`,
                amount,
                method: 'UPI',
                upiId,
                status: 'captured',
            });
        }, 1000);
    });
}

/**
 * Process refund
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund result
 */
async function processRefund(paymentId, amount = null) {
    if (isMockMode()) {
        logger.info(`Mock mode: Processing synthetic refund for payment ${paymentId}`);
        return {
            id: `refund_mock_${Date.now()}`,
            payment_id: paymentId,
            amount: amount ? Math.round(amount * 100) : 'full_amount',
            currency: 'INR',
            status: 'processed',
            created_at: Math.floor(Date.now() / 1000),
            notes: { mode: 'MOCK_TEARDOWN' }
        };
    }

    if (!razorpay) {
        throw new Error('Payment service is not initialized');
    }

    try {
        const refundData = amount ? { amount: Math.round(amount * 100) } : {};
        const refund = await razorpay.payments.refund(paymentId, refundData);
        return refund;
    } catch (error) {
        logger.error('Error processing refund:', error);
        throw new Error('Failed to process refund');
    }
}

/**
 * Mock payment for "Pay at Exit" option
 * @param {Object} bookingDetails - Booking details
 * @returns {Object} Mock payment result
 */
function createPayAtExitPayment(bookingDetails) {
    return {
        success: true,
        paymentId: `pay_at_exit_${Date.now()}`,
        amount: bookingDetails.amount,
        method: 'PAY_AT_EXIT',
        status: 'pending',
        note: 'Payment to be collected at exit',
    };
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object|null>} Payment details or null in mock mode
 */
async function fetchPaymentDetails(paymentId) {
    if (isMockMode()) {
        logger.info(`Mock mode: skipping Razorpay payment fetch for ${paymentId}`);
        return null;
    }
    try {
        return await razorpay.payments.fetch(paymentId);
    } catch (error) {
        logger.error(`Failed to fetch Razorpay payment ${paymentId}:`, error);
        return null;
    }
}

module.exports = {
    createPaymentOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
    processCardPayment,
    processUPIPayment,
    processRefund,
    createPayAtExitPayment,
};

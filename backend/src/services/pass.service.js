const prisma = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Shared helper to calculate monthly pass price from pricing rules
 */
const calculatePassPrice = (rule) => {
    if (!rule) return null;
    
    const price = rule.monthly_pass_price ?? 
                 (rule.daily_max ? rule.daily_max * 30 : rule.hourly_rate * 24 * 30);
    
    return isNaN(price) ? null : price;
};

/**
 * Get available monthly pass options for a facility
 */
const getAvailablePasses = async (facilityId, vehicleType) => {
    const facility = await prisma.parkingFacility.findUnique({
        where: { id: facilityId },
        include: {
            pricing_rules: {
                where: vehicleType ? { vehicle_type: vehicleType } : {}
            }
        }
    });

    if (!facility) {
        throw new AppError('Facility not found', 404);
    }

    // Return pass options based on pricing rules
    return facility.pricing_rules
        .map(rule => {
            const monthlyPrice = calculatePassPrice(rule);
            
            if (!monthlyPrice) return null;

            return {
                facility_id: facilityId,
                facility_name: facility.name,
                vehicle_type: rule.vehicle_type,
                monthly_price: monthlyPrice,
                hourly_rate: rule.hourly_rate,
                daily_max: rule.daily_max
            };
        })
        .filter(Boolean);
};

/**
 * Purchase a monthly pass
 */
const purchasePass = async (customerId, facilityId, vehicleType) => {
    // Get pricing
    const pricingRule = await prisma.pricingRule.findFirst({
        where: { facility_id: facilityId, vehicle_type: vehicleType }
    });

    if (!pricingRule) {
        throw new AppError('Pricing not configured for this vehicle type', 404);
    }

    const price = calculatePassPrice(pricingRule);
    
    if (!price) {
        throw new AppError('Unable to calculate pass price. Missing pricing benchmarks.', 400);
    }

    // Calculate dates (30 days from now for consistent duration)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    // Create pass
    const pass = await prisma.monthlyPass.create({
        data: {
            customer_id: customerId,
            facility_id: facilityId,
            vehicle_type: vehicleType,
            start_date: startDate,
            end_date: endDate,
            price,
            status: 'ACTIVE'
        },
        include: {
            facility: { select: { name: true, address: true } }
        }
    });

    return pass;
};

/**
 * Get user's active passes
 */
const getActivePasses = async (customerId) => {
    const passes = await prisma.monthlyPass.findMany({
        where: {
            customer_id: customerId,
            status: 'ACTIVE',
            end_date: { gte: new Date() }
        },
        include: {
            facility: {
                select: { name: true, address: true, city: true }
            }
        },
        orderBy: { end_date: 'asc' }
    });

    return passes;
};

/**
 * Cancel a monthly pass
 */
const cancelPass = async (customerId, passId) => {
    const pass = await prisma.monthlyPass.findFirst({
        where: { id: passId, customer_id: customerId }
    });

    if (!pass) {
        throw new AppError('Pass not found or does not belong to this user', 404);
    }

    if (pass.status !== 'ACTIVE') {
        throw new AppError('Only active passes can be cancelled', 400);
    }

    const cancelledPass = await prisma.monthlyPass.update({
        where: { id: passId },
        data: { status: 'CANCELLED' },
        include: {
            facility: { select: { name: true, address: true } }
        }
    });

    return cancelledPass;
};

/**
 * Get all active passes for a facility (provider view)
 */
const getFacilityPasses = async (facilityId, providerId) => {
    // Verify facility exists and belongs to this provider
    const facility = await prisma.parkingFacility.findFirst({
        where: { 
            id: facilityId,
            provider_id: providerId
        }
    });

    if (!facility) {
        throw new AppError('Facility not found or you do not have permission to view its passes', 404);
    }

    const passes = await prisma.monthlyPass.findMany({
        where: {
            facility_id: facilityId,
            status: 'ACTIVE',
            end_date: { gte: new Date() }
        },
        include: {
            customer: { select: { id: true, full_name: true, email: true } }
        },
        orderBy: { end_date: 'asc' }
    });

    return passes;
};

module.exports = {
    getAvailablePasses,
    purchasePass,
    getActivePasses,
    cancelPass,
    getFacilityPasses
};

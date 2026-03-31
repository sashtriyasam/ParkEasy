const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { VALID_ROLES } = require('../constants/roles');

/**
 * Update a user's role (Admin only)
 * PATCH /api/v1/admin/users/:userId/role
 */
const updateUserRole = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
        return next(new AppError(`Please provide a valid role (${VALID_ROLES.join(', ')})`, 400));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Guard 1: Prevent self-demotion
    if (userId === req.user.id && role !== 'ADMIN') {
        return next(new AppError('You cannot demote yourself from the ADMIN role.', 400));
    }

    // Guard 2: Prevent removing the last admin
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1) {
            return next(new AppError('Permission denied. Cannot remove the last administrator on the platform.', 403));
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            updated_at: true
        }
    });

    res.status(200).json({
        status: 'success',
        message: `User role updated to ${role}`,
        data: {
            user: updatedUser
        }
    });
});

module.exports = {
    updateUserRole
};

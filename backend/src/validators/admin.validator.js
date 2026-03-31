const { z } = require('zod');
const { VALID_ROLES } = require('../constants/roles');

const roleUpdateSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    role: z.enum(VALID_ROLES, {
      errorMap: () => ({ message: `Please provide a valid role (${VALID_ROLES.join(', ')})` }),
    }),
  }),
});

module.exports = {
  roleUpdateSchema,
};

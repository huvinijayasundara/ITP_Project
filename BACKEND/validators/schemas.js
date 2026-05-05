const { body, param, query } = require('express-validator');

const registerValidator = [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  body('role').isIn(['admin', 'customer', 'delivery']),
];

const loginValidator = [
  body('email').isEmail(),
  body('password').isString().notEmpty(),
];

const createOrderValidator = [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isString().notEmpty(),
  body('items.*.name').isString().notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('totalAmount').isFloat({ min: 0 }),
  body('deliveryAddress.line1').isString().notEmpty(),
  body('deliveryAddress.city').isString().notEmpty(),
  body('deliveryAddress.postalCode').isString().notEmpty(),
  body('deliveryAddress.country').isString().notEmpty(),
  body('contactPhone').isString().notEmpty(),
];

const assignDeliveryValidator = [
  body('orderId').isMongoId().withMessage('orderId must be a valid ObjectId'),
  body('deliveryPersonId').isMongoId().withMessage('deliveryPersonId must be a valid ObjectId'),
  body('eta').optional().isISO8601().toDate(),
  body('notes').optional().isString(),
];

const reassignValidator = [
  param('id').isMongoId(),
  body('deliveryPersonId').isMongoId().withMessage('deliveryPersonId must be a valid ObjectId'),
  body('note').optional().isString(),
];

const updateStatusValidator = [
  param('id').isMongoId(),
  body('status').isIn(['out-for-delivery', 'delivered', 'cancelled']),
  body('note').optional().isString(),
];

const updateMetaValidator = [
  param('id').isMongoId(),
  body('eta').optional().isISO8601(),
  body('notes').optional().isString(),
];

const listDeliveriesValidator = [
  query('status').optional().isIn(['assigned', 'out-for-delivery', 'delivered', 'cancelled']),
  query('orderId').optional().isMongoId(),
  query('deliveryPersonId').optional().isMongoId(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  registerValidator,
  loginValidator,
  createOrderValidator,
  assignDeliveryValidator,
  reassignValidator,
  updateStatusValidator,
  updateMetaValidator,
  listDeliveriesValidator,
  trackParamValidator: [param('orderId').isMongoId()],
};

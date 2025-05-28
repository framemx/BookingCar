const slotController = require('../controllers/slot.controller');

module.exports = [
  {
    method: 'POST',
    path: '/slots',
    handler: slotController.createSlot,
  },
  {
    method: 'GET',
    path: '/slots',
    handler: slotController.getAllSlots,
  },
  {
    method: 'GET',
    path: '/slots/{id}',
    handler: slotController.getSlotById,
  },
  {
    method: 'DELETE',
    path: '/slots/{id}',
    handler: slotController.deleteSlot,
  },
  {
  method: 'PUT',
  path: '/slots/{id}',
  handler: slotController.updateSlot,
  },
];

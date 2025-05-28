const slotService = require('../services/slot.service');
const {
  createSlotSchema,
  getSlotByIdSchema,
  updateSlotSchema,
} = require('../validations/slot.validation');

const createSlot = async (request, h) => {
  try {
    const data = createSlotSchema.parse(request.payload);
    const slot = await slotService.createSlot(data);
    return h.response(slot).code(201);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getAllSlots = async (request, h) => {
  const slots = await slotService.getAllSlots();
  return h.response(slots);
};

const getSlotById = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const slot = await slotService.getSlotById(id);
    if (!slot) return h.response({ error: 'Slot not found' }).code(404);
    return h.response(slot);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const deleteSlot = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const deleted = await slotService.deleteSlot(id);
    return h.response(deleted);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const updateSlot = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const data = updateSlotSchema.parse(request.payload);
    const updatedSlot = await slotService.updateSlot(id, data);
    return h.response(updatedSlot);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot,
  updateSlot,
};

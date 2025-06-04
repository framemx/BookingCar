const slotService = require('../services/slot.service');
const {
  createSlotSchema,
  getSlotByIdSchema,
  updateSlotSchema,
} = require('../validations/slot.validation');

const createSlot = async (request, h) => {
  try {
    console.log('Received payload:', request.payload);
    const data = createSlotSchema.parse(request.payload);
    console.log('Validated data:', data);
    const slot = await slotService.createSlot(data);
    console.log('Created slot:', slot);
    return h.response(slot).code(201);
  } catch (error) {
    console.error('Error in createSlot:', error);
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getAllSlots = async (request, h) => {
  const slots = await slotService.getAllSlots();
  const formattedSlots = slots.map(slot => ({
    ...slot,
    startTime: new Date(slot.startTime).toTimeString().slice(0, 5),
    endTime: new Date(slot.endTime).toTimeString().slice(0, 5),
  }));
  console.log('Fetched slots:', formattedSlots);
  return h.response(formattedSlots);
};

const getSlotById = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const slot = await slotService.getSlotById(id);
    if (!slot) return h.response({ error: 'Slot not found' }).code(404);
    const formattedSlot = {
      ...slot,
      startTime: new Date(slot.startTime).toTimeString().slice(0, 5),
      endTime: new Date(slot.endTime).toTimeString().slice(0, 5),
    };
    console.log('Fetched slot by ID:', formattedSlot);
    return h.response(formattedSlot);
  } catch (error) {
    console.error('Error in getSlotById:', error);
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const deleteSlot = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const deleted = await slotService.deleteSlot(id);
    console.log('Deleted slot ID:', id);
    return h.response(deleted);
  } catch (error) {
    console.error('Error in deleteSlot:', error);
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const updateSlot = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const data = updateSlotSchema.parse(request.payload);
    const updatedSlot = await slotService.updateSlot(id, data);
    const formattedSlot = {
      ...updatedSlot,
      startTime: new Date(updatedSlot.startTime).toTimeString().slice(0, 5),
      endTime: new Date(updatedSlot.endTime).toTimeString().slice(0, 5),
    };
    console.log('Updated slot:', formattedSlot);
    return h.response(formattedSlot);
  } catch (error) {
    console.error('Error in updateSlot:', error);
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getSlotTimes = async (request, h) => {
  try {
    const { id } = getSlotByIdSchema.parse(request.params);
    const slot = await slotService.getSlotById(id);
    if (!slot) return h.response({ error: 'Slot not found' }).code(404);

    const result = [];
    let start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    while (start < end) {
      const next = new Date(start.getTime() + 60 * 60 * 1000);
      if (next <= end) {
        result.push({
          from: start.toTimeString().slice(0, 5),
          to: next.toTimeString().slice(0, 5),
        });
      }
      start = next;
    }

    console.log('Slot times for ID', id, ':', result);
    return h.response(result);
  } catch (error) {
    console.error('Error in getSlotTimes:', error);
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot,
  updateSlot,
  getSlotTimes,
};
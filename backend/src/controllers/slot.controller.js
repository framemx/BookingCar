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
  // ไม่ต้องแปลงเวลาจาก string เป็น Date อีก เพราะเก็บเป็น HH:mm แล้ว
  const formattedSlots = slots.map(slot => ({
    ...slot,
    startTime: slot.startTime,
    endTime: slot.endTime,
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
      startTime: slot.startTime,
      endTime: slot.endTime,
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
      startTime: updatedSlot.startTime,
      endTime: updatedSlot.endTime,
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

    const bookings = await slotService.getBookingsBySlotId(id); // ✅ ดึง booking

    // แปลงช่วงเวลาของ booking ที่มีอยู่แล้ว
    const bookedTimes = bookings.map(booking => ({
      from: booking.startTime, // สมมุติเป็น "10:00"
      to: booking.endTime,     // สมมุติเป็น "11:00"
    }));

    const result = [];
    let [startHour, startMin] = slot.startTime.split(':').map(Number);
    let [endHour, endMin] = slot.endTime.split(':').map(Number);

    let start = new Date();
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (start < end) {
      const next = new Date(start.getTime() + 60 * 60 * 1000); // +1hr

      const fromStr = start.toTimeString().slice(0, 5);
      const toStr = next.toTimeString().slice(0, 5);

      const isBooked = bookedTimes.some(booked =>
        booked.from === fromStr && booked.to === toStr
      );

      if (!isBooked && next <= end) {
        result.push({ from: fromStr, to: toStr });
      }

      start = next;
    }

    console.log('Available slot times for ID', id, ':', result);
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

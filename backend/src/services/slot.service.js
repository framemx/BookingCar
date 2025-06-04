const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSlot = async (data) => {
  const { slotName, date, startTime, endTime, status } = data;
  const startDateTime = new Date(`${date}T${startTime}:00.000Z`);
  const endDateTime = new Date(`${date}T${endTime}:00.000Z`);
  console.log('Creating slot with data:', {
    slotName,
    date,
    startTime: startDateTime,
    endTime: endDateTime,
    status: status || 'AVAILABLE',
  });
  try {
    const slot = await prisma.slot.create({
      data: {
        slotName,
        date, // ส่งเป็น string ได้เลย
        startTime: startDateTime,
        endTime: endDateTime,
        status: status || 'AVAILABLE',
      },
    });
    console.log('Slot created:', slot);
    return slot;
  } catch (error) {
    console.error('Prisma createSlot error:', error);
    throw error;
  }
};

const getAllSlots = async () => {
  const slots = await prisma.slot.findMany();
  console.log('All slots from Prisma:', slots);
  return slots;
};

const getSlotById = async (id) => {
  const slot = await prisma.slot.findUnique({ where: { id } });
  console.log('Slot by ID from Prisma:', slot);
  return slot;
};

const deleteSlot = async (id) => {
  const deleted = await prisma.slot.delete({ where: { id } });
  console.log('Deleted slot from Prisma:', deleted);
  return deleted;
};

const updateSlot = async (id, data) => {
  const { slotName, date, startTime, endTime, status } = data;
  const updateData = {
    slotName,
    date, // ส่งเป็น string ได้เลย
    status,
  };
  if (startTime && date) {
    updateData.startTime = new Date(`${date}T${startTime}:00.000Z`);
  }
  if (endTime && date) {
    updateData.endTime = new Date(`${date}T${endTime}:00.000Z`);
  }
  console.log('Updating slot ID', id, 'with data:', updateData);
  const updated = await prisma.slot.update({
    where: { id },
    data: updateData,
  });
  console.log('Updated slot from Prisma:', updated);
  return updated;
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot,
  updateSlot,
};
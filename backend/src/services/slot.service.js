const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSlot = async (data) => {
  const { slotName, date, startTime, endTime, status } = data;
  console.log('Creating slot with data:', {
    slotName,
    date,
    startTime,
    endTime,
    status: status || 'AVAILABLE',
  });

  try {
    const slot = await prisma.slot.create({
      data: {
        slotName,
        date,
        startTime, // ✅ ไม่มี new Date แล้ว
        endTime,
        status: status || 'AVAILABLE',
      },
    });
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
    date,
    startTime, // ✅ ไม่มี new Date แล้ว
    endTime,
    status,
  };

  console.log('Updating slot ID', id, 'with data:', updateData);
  const updated = await prisma.slot.update({
    where: { id },
    data: updateData,
  });
  return updated;
};

const getBookingsBySlotId = async (slotId) => {
  return await prisma.booking.findMany({
    where: { slotId }, // slotId ต้องมีใน booking model
    select: {
      startTime: true,
      endTime: true,
    },
  });
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot,
  updateSlot,
  getBookingsBySlotId,
};
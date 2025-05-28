const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBookingSlot = async (data) => {
  return await prisma.bookingSlot.create({
    data: {
      bookingId: data.bookingId,
      slotId: data.slotId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    }
  });
};

const getAllBookingSlots = async () => {
  return await prisma.bookingSlot.findMany();
};

const getBookingSlotById = async (id) => {
  return await prisma.bookingSlot.findUnique({ where: { id } });
};

const deleteBookingSlot = async (id) => {
  return await prisma.bookingSlot.delete({ where: { id } });
};

const updateBookingSlot = async (id, data) => {
  const { startTime, endTime, bookingId, slotId } = data;

  return await prisma.bookingSlot.update({
    where: { id },
    data: {
      ...(bookingId !== undefined && { bookingId }),
      ...(slotId !== undefined && { slotId }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
    },
  });
};

module.exports = {
  createBookingSlot,
  getAllBookingSlots,
  getBookingSlotById,
  deleteBookingSlot,
  updateBookingSlot,
};

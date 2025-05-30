const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBookingSlot = async (data) => {
  return await prisma.bookingSlot.create({
    data: {
      bookingId: data.bookingId,
      slotId: data.slotId,
    },
  });
};

const getAllBookingSlots = async () => {
  return await prisma.bookingSlot.findMany({
    include: {
      booking: true,
      slot: true,
    },
  });
};

const getBookingSlotById = async (id) => {
  return await prisma.bookingSlot.findUnique({
    where: { id: Number(id) },
    include: {
      booking: true,
      slot: true,
    },
  });
};

const updateBookingSlot = async (id, data) => {
  return await prisma.bookingSlot.update({
    where: { id: Number(id) },
    data: {
      bookingId: data.bookingId,
      slotId: data.slotId,
    },
  });
};

const deleteBookingSlot = async (id) => {
  return await prisma.bookingSlot.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createBookingSlot,
  getAllBookingSlots,
  getBookingSlotById,
  updateBookingSlot,
  deleteBookingSlot,
};

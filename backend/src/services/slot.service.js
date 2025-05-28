const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSlot = async (data) => {
  return await prisma.slot.create({ data });
};

const getAllSlots = async () => {
  return await prisma.slot.findMany();
};

const getSlotById = async (id) => {
  return await prisma.slot.findUnique({ where: { id } });
};

const deleteSlot = async (id) => {
  return await prisma.slot.delete({ where: { id } });
};

const updateSlot = async (id, data) => {
  return await prisma.slot.update({
    where: { id },
    data,
  });
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot,
  updateSlot,
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBookingServices = async (dataArray) => {
  return await prisma.bookingService.createMany({
    data: dataArray,
    skipDuplicates: true,
  });
};

const getAllBookingServices = async () => {
  return await prisma.bookingService.findMany();
};

const getBookingServiceById = async (id) => {
  return await prisma.bookingService.findUnique({ where: { id } });
};

const deleteBookingService = async (id) => {
  return await prisma.bookingService.delete({ where: { id } });
};

const updateBookingService = async (id, data) => {
  return await prisma.bookingService.update({
    where: { id },
    data,
  });
};

module.exports = {
  createBookingServices,
  getAllBookingServices,
  getBookingServiceById,
  deleteBookingService,
  updateBookingService,
};

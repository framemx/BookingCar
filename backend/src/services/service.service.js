const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllServices = async () => {
  const services = await prisma.service.findMany();
  return services.map(service => ({
    id: service.id,
    sName: service.sName,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
  }));
};

const getServiceById = async (id) => {
  const service = await prisma.service.findUnique({
    where: { id: Number(id) },
  });
  if (!service) return null;
  return {
    id: service.id,
    sName: service.sName,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
  };
};

const createService = async (data) => {
  const service = await prisma.service.create({
    data: {
      sName: data.sName,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
    },
  });
  return {
    id: service.id,
    sName: service.sName,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
  };
};

const updateService = async (id, data) => {
  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: {
      sName: data.sName,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
    },
  });
  return {
    id: service.id,
    sName: service.sName,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
  };
};

const deleteService = async (id) => {
  return await prisma.service.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};

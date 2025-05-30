const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ฟังก์ชันเช็ค slot ว่าง
const checkSlotAvailability = async (tx, slots) => {
  for (const { slotId } of slots) {
    // ดึงข้อมูล slot พร้อมนับจำนวน booking ที่มีอยู่
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
      include: {
        bookingSlots: true,
      },
    });

    if (!slot) {
      throw new Error(`Slot with id ${slotId} does not exist`);
    }

    const currentBookingsCount = slot.bookingSlots.length;

    if (currentBookingsCount >= slot.capacity) {
      throw new Error(`Slot ${slotId} is fully booked`);
    }
  }
};

// ฟังก์ชันเช็ค services ว่ามีอยู่จริง
const checkServicesExist = async (tx, services) => {
  if (services.length === 0) return;

  const servicesExist = await tx.service.findMany({
    where: { id: { in: services } },
  });

  if (servicesExist.length !== services.length) {
    throw new Error('One or more selected services do not exist');
  }
};

const createBooking = async (data) => {
  const { userId, bookingDate, status, description, services = [], slots = [] } = data;

  return await prisma.$transaction(async (tx) => {
    // ตรวจสอบ slot และ service ก่อนสร้าง
    await checkServicesExist(tx, services);
    await checkSlotAvailability(tx, slots);

    const booking = await tx.booking.create({
      data: {
        userId,
        bookingDate: new Date(bookingDate),
        status,
        description,
      },
    });

    if (services.length > 0) {
      const bookingServicesData = services.map((serviceId) => ({
        bookingId: booking.id,
        serviceId,
      }));
      await tx.bookingService.createMany({ data: bookingServicesData });
    }

    if (slots.length > 0) {
      const bookingSlotsData = slots.map(({ slotId, startTime, endTime }) => ({
        bookingId: booking.id,
        slotId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }));
      await tx.bookingSlot.createMany({ data: bookingSlotsData });
    }

    return booking;
  });
};

const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      bookingServices: { include: { service: true } },
      bookingSlots: { include: { slot: true } },
      user: true,
    },
  });
};

const getBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      bookingServices: { include: { service: true } },
      bookingSlots: { include: { slot: true } },
      user: true,
    },
  });
};

const updateBooking = async (id, data) => {
  const { status, bookingDate, description, services, slots } = data;

  return await prisma.$transaction(async (tx) => {
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (bookingDate !== undefined) updateData.bookingDate = new Date(bookingDate);
    if (description !== undefined) updateData.description = description;

    // ถ้ามี services หรือ slots ให้ตรวจสอบก่อนอัปเดต
    if (services) {
      await checkServicesExist(tx, services);
    }
    if (slots) {
      await checkSlotAvailability(tx, slots);
    }

    const updatedBooking = await tx.booking.update({
      where: { id },
      data: updateData,
    });

    if (services) {
      await tx.bookingService.deleteMany({ where: { bookingId: id } });
      const bookingServicesData = services.map((serviceId) => ({
        bookingId: id,
        serviceId,
      }));
      await tx.bookingService.createMany({ data: bookingServicesData });
    }

    if (slots) {
      await tx.bookingSlot.deleteMany({ where: { bookingId: id } });
      const bookingSlotsData = slots.map(({ slotId, startTime, endTime }) => ({
        bookingId: id,
        slotId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }));
      await tx.bookingSlot.createMany({ data: bookingSlotsData });
    }

    return updatedBooking;
  });
};

const deleteBooking = async (id) => {
  return await prisma.booking.delete({ where: { id } });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ฟังก์ชันเช็ค slot ว่าง
// ✅ แก้ไข checkSlotAvailability ให้เช็กซ้ำซ้อนของเวลา
const checkSlotAvailability = async (tx, slots) => {
  for (const { slotId, startTime, endTime } of slots) {
    const overlapping = await tx.bookingSlot.count({
  where: {
    slotId,
    startTime: { lt: new Date(endTime) },
    endTime: { gt: new Date(startTime) },
    booking: {
      status: 'confirmed'  // ✅ เช็กเฉพาะ booking ที่ยืนยันแล้วเท่านั้น
    }
  },
});


    const slot = await tx.slot.findUnique({ where: { id: slotId } });

    if (!slot) throw new Error(`Slot ${slotId} not found`);

    if (overlapping >= slot.capacity) {
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
    throw new Error("One or more selected services do not exist");
  }
};

const createBooking = async (data) => {
  const {
    userId,
    bookingDate,
    status,
    description,
    services = [],
    slots = [],
  } = data;

  return await prisma.$transaction(async (tx) => {
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

    // บริการ
    if (services.length > 0) {
      const bookingServicesData = services.map((serviceId) => ({
        bookingId: booking.id,
        serviceId,
      }));
      await tx.bookingService.createMany({ data: bookingServicesData });
    }

    // ✅ slot
    if (slots.length > 0) {
      const bookingSlotsData = [];

      for (const { slotId, startTime, endTime } of slots) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        while (start < end) {
          const next = new Date(start.getTime() + 60 * 60 * 1000); // +1h
          bookingSlotsData.push({
            bookingId: booking.id,
            slotId,
            startTime: new Date(start),
            endTime: new Date(next),
          });
          start.setTime(next.getTime());
        }
      }

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
    if (bookingDate !== undefined)
      updateData.bookingDate = new Date(bookingDate);
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
  return await prisma.$transaction(async (tx) => {
    // 🧹 ลบ bookingSlots ที่เกี่ยวข้อง
    await tx.bookingSlot.deleteMany({ where: { bookingId: id } });

    // 🧹 ลบ bookingServices ที่เกี่ยวข้อง
    await tx.bookingService.deleteMany({ where: { bookingId: id } });

    // ✅ ลบ booking หลัก
    return await tx.booking.delete({ where: { id } });
  });
};


const getBookingsByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return [];

  return await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      bookingServices: { include: { service: true } },
      bookingSlots: { include: { slot: true } },
      user: true,
    },
  });
};

const getBookingsByUserId = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      bookingServices: { include: { service: true } },
      bookingSlots: { include: { slot: true } },
      user: true,
    },
  });
};


module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByEmail,
  getBookingsByUserId,
};

const userRoute = require("./user.route");
const serviceRoute = require('./service.route');
const slotRoute = require("./slot.route");
const bookingRoute = require('./booking.route');
const bookingServiceRoute = require("./bookingService.route");
const bookingSlotRoute = require("./bookingSlot.route");

module.exports = [
    ...userRoute,
    ...serviceRoute,
    ...slotRoute,
    ...bookingRoute,
    ...bookingServiceRoute,
    ...bookingSlotRoute,
];



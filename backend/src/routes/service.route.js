const serviceController = require("../controllers/service.controller");

module.exports = [
  {
    method: "POST",
    path: "/services",
    options: serviceController.createService,
  },
  {
    method: "GET",
    path: "/services",
    options: serviceController.getAllServices,
  },
  {
    method: "GET",
    path: "/services/{id}",
    options: serviceController.getServiceById,
  },
  {
    method: "PUT",
    path: "/services/{id}",
    options: serviceController.updateService,
  },
  {
    method: "DELETE",
    path: "/services/{id}",
    options: serviceController.deleteService,
  },
];

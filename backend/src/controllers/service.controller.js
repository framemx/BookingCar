const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../services/service.service");

const { success, error } = require("../utils/response");

const validateZod = require("../validations/validateZod")

const {
  createServiceSchema,
  updateServiceSchema,
} = require("../validations/service.validation");

const serviceController = {
  createService: {
    description: "Create a new service",
    tags: ["api", "service"],
    validate: {
      payload: validateZod(createServiceSchema),
    },
    handler: async (request, h) => {
      try {
        const data = request.payload;
        const service = await createService(data);
        return success(h, service, "Service created successfully");
      } catch (err) {
        console.error("Create service error:", err);
        return error(h, err.message);
      }
    },
  },

  getAllServices: {
    description: "Get all services",
    tags: ["api", "service"],
    handler: async (request, h) => {
      try {
        const services = await getAllServices();
        return success(h, services);
      } catch (err) {
        console.error("Get all services error:", err);
        return error(h, err.message);
      }
    },
  },

  getServiceById: {
    description: "Get service by ID",
    tags: ["api", "service"],
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const service = await getServiceById(id);
        if (!service) {
          return error(h, "Service not found", 404);
        }
        return success(h, service);
      } catch (err) {
        console.error("Get service by ID error:", err);
        return error(h, err.message);
      }
    },
  },

  updateService: {
    description: "Update a service",
    tags: ["api", "service"],
    validate: {
      payload: validateZod(updateServiceSchema),
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const data = request.payload;
        const service = await updateService(id, data);
        return success(h, service, "Service updated successfully");
      } catch (err) {
        console.error("Update service error:", err);
        return error(h, err.message);
      }
    },
  },

  deleteService: {
    description: "Delete a service",
    tags: ["api", "service"],
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        await deleteService(id);
        return success(h, null, "Service deleted successfully");
      } catch (err) {
        console.error("Delete service error:", err);
        return error(h, err.message);
      }
    },
  },
};

module.exports = serviceController;

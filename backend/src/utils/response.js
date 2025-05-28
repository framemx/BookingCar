module.exports = {
  success: (h, data, message = "Success", code = 200) => {
    return h.response({ success: true, message, status: code, data }).code(code);
  },
  created: (h, data, message = "Resource created", code = 201) => {
    return h.response({ success: true, message, status: code, data }).code(code);
  },
  error: (h, message = "Something went wrong", code = 500) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  notFound: (h, message = "Resource not found", code = 404) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  unauthorized: (h, message = "Unauthorized access", code = 401) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  forbidden: (h, message = "Forbidden", code = 403) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  badRequest: (h, message = "Bad request", code = 400) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  conflict: (h, message = "Conflict occurred", code = 409) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  serverError: (h, message = "Internal server error", code = 500) => {
    return h.response({ success: false, message, status: code }).code(code);
  },

  noContent: (h, message = "No content available", code = 204) => {
    return h.response({ success: true, message, status: code }).code(code);
  },
  
};
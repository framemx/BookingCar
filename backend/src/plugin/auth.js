const Boom = require("@hapi/boom");
const { verifyToken } = require("../utils/jwt");

exports.authPlugin = {
  name: "auth",
  version: "1.0.0",
  register: async (server, options) => {
    server.auth.scheme("jwt", () => ({
      authenticate: async (request, h) => {
        const authorization = request.headers.authorization;

        if (!authorization) {
          throw Boom.unauthorized("No token provided", "Bearer");
        }

        const [scheme, token] = authorization.split(" ");
        if (scheme !== "Bearer" || !token) {
          throw Boom.unauthorized("Bad auth format", "Bearer");
        }

        try {
          const credentials = verifyToken(token);
          // เพิ่มข้อมูล role และสถานะใน credentials
          return h.authenticated({
            credentials: {
              ...credentials,
              scope: [credentials.role], // ใช้ role เป็น scope
              isAuthenticated: true,    // เพิ่ม flag เพื่อบ่งบอกสถานะ
            },
          });
        } catch (err) {
          throw Boom.unauthorized("Invalid or expired token", "Bearer", {
            error: "TokenExpired", // ส่งข้อมูลเพิ่มเติมถ้าต้องการ
          });
        }
      },
    }));

    server.auth.strategy("jwt", "jwt");
    server.auth.default("jwt"); // ใช้ JWT เป็นค่า default สำหรับทุก route
  },
};
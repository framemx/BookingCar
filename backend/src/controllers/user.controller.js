    const {
        createUserSchema,
        updateUserSchema,
        idParamSchema,
        loginUserSchema,
    } = require("../validations/user.validation");

    const userService = require("../services/user.service");
    const {
        success,
        error,
        notFound,
        created,
    } = require("../utils/response");

    const validateZod = require("../validations/validateZod");
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const jwt = require("jsonwebtoken");
    const bcrypt = require("bcryptjs"); // ✅ เพิ่ม bcrypt

    // ✅ POST /users/login (แก้ไขแล้ว)
    const loginUser = {
        auth: false,
        handler: async (request, h) => {
            const { email, password } = request.payload;

            try {
                const user = await prisma.user.findFirst({
                    where: { email },
                });

                if (!user) {
                    return h.response({
                        success: false,
                        message: "Invalid email or password",
                    }).code(401);
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return h.response({
                        success: false,
                        message: "Invalid email or password",
                    }).code(401);
                }

                const token = jwt.sign(
                    { uId: user.id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                const responseUser = {
                    id: user.id,
                    uName: user.uName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    token,
                };

                return h.response({
                    success: true,
                    message: "Login successful",
                    data: responseUser,
                }).code(200);
            } catch (err) {
                console.error("Login error:", err);
                return h.response({
                    success: false,
                    message: "Internal server error",
                }).code(500);
            }
        },
    };

    const getAllUsers = {
        description: "Get list of all users",
        tags: ["api", "user"],
        handler: async (request, h) => {
            try {
                const users = await userService.getAllUsers();
                return success(h, users, "Fetched users successfully");
            } catch (err) {
                console.error(err);
                return error(h, err.message);
            }
        },
    };

    const getUserById = {
        description: "Get user by ID",
        tags: ["api", "user"],
        validate: {
            params: validateZod(idParamSchema),
        },
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const user = await userService.getUserById(Number(id));
                if (!user) return notFound(h, "User not found");
                return success(h, user, "Fetched user successfully");
            } catch (err) {
                console.error(err);
                return error(h, err.message);
            }
        },
    };

    const getMe = {
        description: "Get current user's profile",
        tags: ["api", "user"],
        handler: async (request, h) => {
            const { uId } = request.auth.credentials;
            const user = await userService.getUserById(uId);
            return success(h, user, "Fetched profile successfully");
        },
    };

    const updateMe = {
        description: "Update current user's profile",
        tags: ["api", "user"],
        validate: { payload: validateZod(updateUserSchema) },
        handler: async (request, h) => {
            const { uId } = request.auth.credentials;
            const updated = await userService.updateUser(uId, request.payload);
            return success(h, updated, "Profile updated successfully");
        },
    };

    const createUser = {
        description: "Create new user",
        tags: ["api", "user"],
        auth: false,
        validate: {
            payload: validateZod(createUserSchema),
        },
        handler: async (request, h) => {
            try {
                const newUser = await userService.createUser(request.payload); // ตรวจสอบว่ารหัสผ่านถูกเข้ารหัสใน service แล้ว
                return created(h, newUser, "User created successfully");
            } catch (err) {
                if (err.code === "P2002" && err.meta?.target?.includes("email")) {
                    return error(h, "This email is already in use.");
                }
                console.error("Error creating user:", err);
                return error(h, err.message);
            }
        },
    };

    const updateUser = {
        description: "Update user by ID",
        tags: ["api", "user"],
        validate: {
            params: validateZod(idParamSchema),
            payload: validateZod(updateUserSchema),
        },
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const updatedUser = await userService.updateUser(Number(id), request.payload);
                return success(h, updatedUser, "User updated successfully");
            } catch (err) {
                console.error("Error updating user:", err);
                return error(h, err.message);
            }
        },
    };

    const deleteUser = {
        description: "Delete user by ID",
        tags: ["api", "user"],
        validate: {
            params: validateZod(idParamSchema),
        },
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const user = await userService.getUserById(Number(id));
                if (!user) return notFound(h, "User not found");

                await userService.deleteUser(Number(id));
                return success(h, "User deleted successfully");
            } catch (err) {
                console.error("Error deleting user:", err);
                return error(h, err.message);
            }
        },
    };

    module.exports = {
        getAllUsers,
        getUserById,
        getMe,
        updateMe,
        createUser,
        updateUser,
        deleteUser,
        loginUser,
    };

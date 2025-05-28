const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map(user => ({
    id: user.id,
    uName: user.uName,
    email: user.email,
    role: user.role,
    phone: user.phone,
  }));
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return null;
  return {
    id: user.id,
    uName: user.uName,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
};

const getUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const comparePassword = async (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const createData = {
    uName: data.uName,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    role: data.role || "USER",
  };

  const user = await prisma.user.create({ data: createData });

  return {
    id: user.id,
    uName: user.uName,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
};

const updateUser = async (id, data) => {
  const updateData = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }
  const updatedUser = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
  });
  // Return only public fields (exclude password)
  return {
    id: updatedUser.id,
    uName: updatedUser.uName,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
  };
};

const deleteUser = async (id) => {
  return await prisma.user.delete({ where: { id: Number(id) } });
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  comparePassword,
  createUser,
  updateUser,
  deleteUser,
};

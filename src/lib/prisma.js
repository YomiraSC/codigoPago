import { PrismaClient } from "@prisma/client";

// 🔹 Definimos el objeto global para que no se creen múltiples instancias en desarrollo
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

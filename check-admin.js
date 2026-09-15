const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    console.log("=== ADMIN TERDAFTAR ===");
    console.log(JSON.stringify(admins, null, 2));
  } catch (error) {
    console.log("Gagal koneksi ke database:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();

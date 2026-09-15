const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding database...');
  
  // Hash password
  const password = await bcrypt.hash('password123', 10);
  
  // Buat Admin Default
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@tnll.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@tnll.com',
      username: 'superadmin',
      password: password,
      role: 'superadmin',
      isActive: true,
    },
  });
  
  console.log('✅ Akun Admin berhasil dibuat!');
  console.log('--------------------------------');
  console.log('Email    : admin@tnll.com');
  console.log('Password : password123');
  console.log('--------------------------------');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function test() {
  console.log("Mengetes koneksi ke Supabase...");
  const email = 'admin@tnll.com';
  const password = 'password123';
  
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.log("❌ GAGAL: Akun admin tidak ditemukan di database!");
    return;
  }
  
  console.log("✅ Akun admin ditemukan:", admin.email);
  const isValid = await bcrypt.compare(password, admin.password);
  console.log("✅ Status kecocokan kata sandi:", isValid);
  
  if (isValid) {
    console.log("🎉 Kesimpulan: Login lokal BERHASIL. Masalah murni ada di koneksi Vercel!");
  } else {
    console.log("❌ Kesimpulan: Password salah.");
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());

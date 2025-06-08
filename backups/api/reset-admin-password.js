const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password to admin123...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Update the admin user
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { 
        passwordHash: hashedPassword,
        isActive: true
      }
    });
    
    console.log('✅ Password reset successfully for user:', updatedUser.username);
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Role:', updatedUser.role);
    console.log('✓ Active:', updatedUser.isActive);
    console.log('\n🔑 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    
    // If user doesn't exist, create it
    if (error.code === 'P2025') {
      console.log('📝 Admin user not found. Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@somersetwindowcleaning.co.uk',
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Created new admin user:', newUser.username);
      console.log('\n🔑 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
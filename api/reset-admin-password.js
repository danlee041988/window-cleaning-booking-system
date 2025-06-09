const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const readline = require('readline');

const prisma = new PrismaClient();

// Password validation function
function validatePassword(password) {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) errors.push(`At least ${minLength} characters`);
  if (!hasUpperCase) errors.push('At least one uppercase letter');
  if (!hasLowerCase) errors.push('At least one lowercase letter');
  if (!hasNumbers) errors.push('At least one number');
  if (!hasSymbols) errors.push('At least one special character');
  
  return { isValid: errors.length === 0, errors };
}

// Generate secure password
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter new admin password (or press Enter to generate secure password): ', (password) => {
      rl.close();
      resolve(password.trim());
    });
  });
}

async function resetAdminPassword() {
  try {
    console.log('🔐 Admin Password Reset Tool');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let newPassword = await promptPassword();
    
    if (!newPassword) {
      newPassword = generateSecurePassword();
      console.log('🔄 Generated secure password:', newPassword);
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        console.log('❌ Password does not meet security requirements:');
        validation.errors.forEach(error => console.log(`   • ${error}`));
        console.log('\n🔄 Generating secure password instead...');
        newPassword = generateSecurePassword();
        console.log('Generated password:', newPassword);
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the admin user
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { 
        passwordHash: hashedPassword,
        isActive: true
      }
    });
    
    console.log('\n✅ Password reset successfully for user:', updatedUser.username);
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Role:', updatedUser.role);
    console.log('✓ Active:', updatedUser.isActive);
    console.log('\n🔑 New login credentials:');
    console.log('   Username: admin');
    console.log('   Password:', newPassword);
    console.log('\n⚠️  Please save this password securely and change it after first login.');
    
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
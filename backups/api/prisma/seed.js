const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default lead statuses
  console.log('Creating lead statuses...');
  
  const statusesToCreate = [
    // ACTIVE STATUSES (Requiring Action)
    { name: 'New', description: 'Newly submitted booking request', color: '#3B82F6', sortOrder: 1, isDefault: true, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Initial Contact', description: 'First contact made with customer', color: '#F59E0B', sortOrder: 2, isDefault: false, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Qualifying', description: 'Understanding customer requirements', color: '#A855F7', sortOrder: 3, isDefault: false, isActive: true, category: 'active', followUpDays: 2 },
    { name: 'Site Visit Required', description: 'Needs physical assessment for quote', color: '#EC4899', sortOrder: 4, isDefault: false, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Site Visit Scheduled', description: 'Appointment booked for assessment', color: '#8B5CF6', sortOrder: 5, isDefault: false, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Site Visit Completed', description: 'Assessment done, preparing quote', color: '#06B6D4', sortOrder: 6, isDefault: false, isActive: true, category: 'active', followUpDays: 2 },
    { name: 'Quote Sent', description: 'Quote provided to customer', color: '#10B981', sortOrder: 7, isDefault: false, isActive: true, category: 'active', followUpDays: 3 },
    { name: 'Follow-up Required', description: 'Customer thinking, needs gentle nudging', color: '#F59E0B', sortOrder: 8, isDefault: false, isActive: true, category: 'active', followUpDays: 7 },
    { name: 'Follow-up Overdue', description: 'No response, urgent action needed', color: '#EF4444', sortOrder: 9, isDefault: false, isActive: true, category: 'urgent', followUpDays: 1 },
    
    // COMPLETED STATUSES (Archive)
    { name: 'Accepted - Squeegee', description: 'Quote accepted, transferred to Squeegee', color: '#059669', sortOrder: 10, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Rejected', description: 'Customer declined quote', color: '#DC2626', sortOrder: 11, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'No Response', description: 'Customer went silent after follow-ups', color: '#6B7280', sortOrder: 12, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Not Viable', description: 'Cannot provide service (access, location, etc.)', color: '#9CA3AF', sortOrder: 13, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Converted Other', description: 'Became customer through different route', color: '#10B981', sortOrder: 14, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    
    // LEGACY STATUSES (for backwards compatibility)
    { name: 'Contacted', description: 'Initial contact made with customer (legacy)', color: '#F59E0B', sortOrder: 15, isDefault: false, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Accepted', description: 'Customer has accepted the quote (legacy)', color: '#10B981', sortOrder: 16, isDefault: false, isActive: true, category: 'active', followUpDays: 1 },
    { name: 'Scheduled', description: 'Job has been scheduled (legacy)', color: '#06B6D4', sortOrder: 17, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Completed', description: 'Job has been completed (legacy)', color: '#059669', sortOrder: 18, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Cancelled', description: 'Booking was cancelled (legacy)', color: '#EF4444', sortOrder: 19, isDefault: false, isActive: false, category: 'completed', followUpDays: null },
    { name: 'Lost', description: 'Lead did not convert (legacy)', color: '#6B7280', sortOrder: 20, isDefault: false, isActive: false, category: 'completed', followUpDays: null }
  ];

  for (const status of statusesToCreate) {
    try {
      await prisma.leadStatus.create({
        data: status
      });
      console.log(`✅ Created status: ${status.name}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Status already exists: ${status.name}`);
      } else {
        console.error(`❌ Error creating status ${status.name}:`, error);
      }
    }
  }

  // Create default admin user
  console.log('Creating default admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  try {
    const adminUser = await prisma.user.create({
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
    console.log('✅ Created admin user:', adminUser.username);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }

  // Create system configuration
  console.log('Creating system configuration...');
  const systemConfigs = [
    {
      key: 'business_info',
      value: {
        name: 'Somerset Window Cleaning',
        phone: '+44 1234 567890',
        email: 'info@somersetwindowcleaning.co.uk',
        address: 'Somerset, UK'
      },
      description: 'Business contact information',
      category: 'general'
    },
    {
      key: 'pricing_config',
      value: {
        baseRates: {
          house: { small: 15, medium: 25, large: 40 },
          flat: { small: 10, medium: 15, large: 25 }
        },
        multipliers: {
          difficult_access: 1.5,
          solar_panels: 2.0,
          conservatory: 1.3
        },
        quoteValidityDays: 30
      },
      description: 'Pricing configuration',
      category: 'pricing'
    },
    {
      key: 'notification_settings',
      value: {
        emailNotifications: true,
        smsNotifications: false,
        newLeadAlert: true,
        followUpReminders: true
      },
      description: 'Notification preferences',
      category: 'notifications'
    },
    {
      key: 'lead_assignment',
      value: {
        autoAssign: false,
        roundRobin: false,
        defaultAssignee: null
      },
      description: 'Lead assignment rules',
      category: 'workflow'
    },
    {
      key: 'follow_up_defaults',
      value: {
        initialFollowUpHours: 24,
        reminderIntervals: [1, 3, 7]
      },
      description: 'Follow-up timing defaults',
      category: 'workflow'
    }
  ];

  for (const config of systemConfigs) {
    try {
      await prisma.systemConfig.create({
        data: config
      });
      console.log(`✅ Created config: ${config.key}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Config already exists: ${config.key}`);
      } else {
        console.error(`❌ Error creating config ${config.key}:`, error);
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
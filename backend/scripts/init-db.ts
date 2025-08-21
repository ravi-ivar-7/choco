import 'dotenv/config';
import { db } from '../lib/db';
import { teams, users, teamMembers } from '../lib/schema';
import { hashPassword } from '../utils/password';
import { createId } from '@paralleldrive/cuid2';

async function initializeDatabase() {
  console.log('🍫 Initializing Choco database...');

  try {
    // Create demo team
    const teamId = createId();
    const adminId = createId();
    
    await db.insert(teams).values({
      id: teamId,
      name: 'Demo Team',
      description: 'Demo team for web platform access',
      platformAccountId: 'demo-account-123',
      ownerId: adminId,
    });

    console.log('✅ Created demo team');

    // Create demo admin user
    const adminEmail = 'admin@gmail.com';
    const hashedPassword = await hashPassword('admin');
    
    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      isActive: true,
    });
    
    // Add admin user to team as owner/admin
    await db.insert(teamMembers).values({
      id: createId(),
      userId: adminId,
      teamId: teamId,
      role: 'admin',
      invitedBy: adminId,
    });

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n🔐 Admin credentials:');
    console.log('  Email: admin@gmail.com');
    console.log('  Password: admin');
    console.log('\n📝 Notes:');
    console.log('  - Demo team created with encrypted token storage');
    console.log('  - Additional users can be added via admin panel');
    console.log('  - Users must register with their own secure passwords');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase().then(() => {
  console.log('Database initialization complete');
  process.exit(0);
}).catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});

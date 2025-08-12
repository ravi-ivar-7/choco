import 'dotenv/config';
import { db } from '../lib/db';
import { teams, users, tokens } from '../lib/schema';
import { encryptToken, hashToken } from '../lib/crypto';
import { generateAndHashInitialPassword } from '../lib/password-utils';
import { createId } from '@paralleldrive/cuid2';

async function initializeDatabase() {
  console.log('🍫 Initializing Choco database...');

  try {
    // Create demo team
    const teamId = createId();
    await db.insert(teams).values({
      id: teamId,
      name: 'Demo Team',
      description: 'Demo team for web platform access',
      platformAccountId: 'demo-account-123',
    });

    // Create demo admin user with password
    const adminId = createId();
    const adminEmail = 'admin@gmail.com';
    const hashedPassword = await generateAndHashInitialPassword(adminEmail);
    
    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      teamId: teamId,
      isActive: true,
    });

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n🔐 Admin credentials:');
    console.log('  Email: admin@gmail.com');
    console.log('  Password: admin');
    console.log('\n📝 Notes:');
    console.log('  - Demo team created with encrypted token storage');
    console.log('  - Additional users can be added via admin panel');
    console.log('  - Extension users will use email username as password');

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

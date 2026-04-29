import { db } from './lib/db';
import { users, plans } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function check() {
  const allPlans = await db.select().from(plans);
  console.log('Available Plans:', allPlans.map(p => p.name));

  const allUsers = await db.select().from(users);
  console.log('Users and their plans:');
  allUsers.forEach(u => {
    console.log(`- ${u.email}: ${u.plan}`);
  });
}

check().catch(console.error);

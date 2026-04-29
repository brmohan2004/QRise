
import { db } from '../lib/db';
import { plans } from '../lib/db/schema';

async function checkPlans() {
  try {
    const allPlans = await db.select().from(plans);
    console.log(JSON.stringify(allPlans, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

checkPlans().catch(console.error);

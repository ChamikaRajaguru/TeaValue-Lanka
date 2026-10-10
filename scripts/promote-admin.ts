import { config } from 'dotenv';
config({ path: '.env.local' });
import { promoteUserToAdmin } from '../src/lib/auth';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Error: Please provide the user email to promote.');
    console.error('Usage: npm run promote-admin <email@example.com>');
    process.exit(1);
  }

  console.log(`Promoting user ${email} to Administrator...`);
  const success = await promoteUserToAdmin(email, 'CLI-Script');

  if (success) {
    console.log(`Success: User ${email} has been promoted to Administrator role.`);
    process.exit(0);
  } else {
    console.error(`Error: User with email ${email} was not found in database.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Promotion failed:', err);
  process.exit(1);
});

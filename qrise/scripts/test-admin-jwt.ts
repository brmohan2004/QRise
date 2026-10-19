import * as jose from 'jose';
import dotenv from 'dotenv';
import path from 'path';

const adminEnv = dotenv.config({ path: 'c:/Users/mohan/Desktop/QRise/qrise-admin/.env' }).parsed || {};
const jwtSecret = adminEnv.JWT_SECRET;
console.log('Admin JWT_SECRET present:', !!jwtSecret);

async function main() {
  const secret = new TextEncoder().encode(jwtSecret);
  const token = await new jose.SignJWT({
    id: 'admin_test_session',
    email: 'mohanbr2004@gmail.com',
    is_admin: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  console.log('Generated token. Sending request to http://localhost:3001/dashboard ...');
  const res = await fetch('http://localhost:3001/dashboard', {
    headers: {
      Cookie: `admin_session=${token}`,
    },
    redirect: 'manual',
  });
  console.log('Response status:', res.status);
  console.log('Location:', res.headers.get('location'));
}

main().catch(console.error);

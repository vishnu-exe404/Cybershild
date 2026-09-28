/**
 * End-to-end smoke test against a RUNNING backend + real database.
 *   1. npm run dev            (in one terminal)
 *   2. npm run smoke          (in another)
 * Uses ADMIN_USERNAME / ADMIN_PASSWORD from .env for the admin checks.
 * Creates a temporary user and removes it afterwards.
 */
require('dotenv').config();

const BASE = process.env.SMOKE_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;

function makeClient() {
  const jar = {};
  return async (method, path, body) => {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; '),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const line of res.headers.getSetCookie?.() || []) {
      const [pair] = line.split(';');
      const i = pair.indexOf('=');
      const name = pair.slice(0, i);
      const value = pair.slice(i + 1);
      if (!value || /expires=Thu, 01 Jan 1970/i.test(line)) delete jar[name];
      else jar[name] = value;
    }
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };
}

let failed = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
  if (!cond) failed++;
}

(async () => {
  const user = makeClient();
  const admin = makeClient();
  const stamp = Date.now().toString(36);
  const creds = { name: 'Smoke Test', email: `smoke_${stamp}@example.com`, username: `smoke_${stamp}`, password: 'SmokeTest123!' };

  let r = await user('GET', '/health');
  check('health + database reachable', r.status === 200 && r.data.db === 'ok', JSON.stringify(r.data));
  if (r.status !== 200) {
    console.log('\nBackend or database is not reachable - fix that first (check DATABASE_URL, run migrations).');
    process.exit(1);
  }

  r = await user('POST', '/analyze', { text: 'Share your OTP immediately or your account will be blocked. Click http://sbi-kyc-update.xyz' });
  check('analyze (anonymous) flags a scam', r.status === 200 && r.data.riskLevel !== 'SAFE', JSON.stringify(r.data));

  r = await user('POST', '/auth/register', creds);
  check('register', r.status === 201, JSON.stringify(r.data));
  r = await user('GET', '/auth/me');
  check('session cookie works (/auth/me)', r.status === 200 && r.data.user?.username === creds.username);
  await user('POST', '/analyze', { text: 'You have won a lottery, click here to claim' });
  r = await user('GET', '/history');
  check('history saved for logged-in user', r.status === 200 && r.data.records?.length === 1);
  r = await user('PATCH', '/auth/me', { name: 'Smoke Renamed' });
  check('update profile', r.status === 200 && r.data.user?.name === 'Smoke Renamed');
  r = await user('POST', '/auth/change-password', { currentPassword: creds.password, newPassword: 'SmokeTest456!' });
  check('change password', r.status === 200);
  await user('POST', '/auth/logout');
  r = await user('GET', '/auth/me');
  check('logout ends session', r.status === 401);
  r = await user('POST', '/auth/login', { identifier: creds.email, password: 'SmokeTest456!', rememberMe: false });
  check('login with new password', r.status === 200);

  r = await user('GET', '/admin/users');
  check('user session cannot access admin API', r.status === 401);

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    console.log('SKIP  admin checks (ADMIN_USERNAME / ADMIN_PASSWORD not set in .env)');
  } else {
    r = await admin('POST', '/admin/auth/login', { username: adminUser, password: adminPass });
    check('admin login (did you run `npm run prisma:seed`?)', r.status === 200, JSON.stringify(r.data));
    if (r.status === 200) {
      r = await admin('GET', `/admin/users?search=${creds.username}`);
      check('admin can search users', r.status === 200 && r.data.total === 1);
      const id = r.data.items?.[0]?.id;
      r = await admin('GET', '/admin/stats');
      check('admin stats', r.status === 200 && typeof r.data.totalChecks === 'number');
      r = await admin('DELETE', `/admin/users/${id}`);
      check('admin deletes the temporary user (cleanup)', r.status === 200);
      await admin('POST', '/admin/auth/logout');
    }
  }

  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed.');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('Smoke test crashed:', e.message);
  process.exit(1);
});

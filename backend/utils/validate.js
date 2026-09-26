const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validateRegistration({ name, email, username, password }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!username || !USERNAME_RE.test(username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore only).';
  }
  if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

module.exports = { validateRegistration, EMAIL_RE, USERNAME_RE };

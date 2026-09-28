const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function isString(v) {
  return typeof v === 'string';
}

function validateRegistration({ name, email, username, password }) {
  const errors = {};
  if (!isString(name) || !name.trim() || name.trim().length > 80) errors.name = 'Name is required (max 80 characters).';
  if (!isString(email) || !EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
  if (!isString(username) || !USERNAME_RE.test(username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore only).';
  }
  if (!isString(password) || password.length < 8 || password.length > 128) {
    errors.password = 'Password must be 8-128 characters.';
  }
  return errors;
}

/** For partial updates: only validates fields that are present. */
function validateProfileFields({ name, email, username }) {
  const errors = {};
  if (name !== undefined && (!isString(name) || !name.trim() || name.trim().length > 80)) {
    errors.name = 'Name must be 1-80 characters.';
  }
  if (email !== undefined && (!isString(email) || !EMAIL_RE.test(email) || email.length > 254)) {
    errors.email = 'Enter a valid email address.';
  }
  if (username !== undefined && (!isString(username) || !USERNAME_RE.test(username))) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore only).';
  }
  return errors;
}

function validateNewPassword(password) {
  if (!isString(password) || password.length < 8 || password.length > 128) {
    return 'Password must be 8-128 characters.';
  }
  return null;
}

module.exports = { validateRegistration, validateProfileFields, validateNewPassword, EMAIL_RE, USERNAME_RE };

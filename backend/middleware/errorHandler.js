// Centralized error handler: consistent JSON errors, no stack traces or internals leaked.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'This origin is not allowed.' });
  }

  // Prisma: database unreachable / not initialised
  if (err.code === 'P1001' || err.code === 'P1002' || err.name === 'PrismaClientInitializationError') {
    console.error('[db] connection problem:', err.message);
    return res.status(503).json({ error: 'The database is unavailable right now. Please try again shortly.' });
  }

  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    error: status === 500 ? 'Something went wrong on our end. Please try again.' : err.message,
  });
}

module.exports = errorHandler;

// Centralized error handler. Keeps error shapes consistent and avoids
// leaking stack traces / internals to the client.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message =
    status === 500 ? 'Something went wrong on our end. Please try again.' : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;

exports.sendError = (res, message, status = 400) => {
  res.status(status).json({ error: message });
};

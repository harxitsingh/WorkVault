export const sendSuccess = (res, data, param3 = 200, param4 = {}) => {
  let statusCode = 200;
  let message = undefined;
  let extra = {};

  if (typeof param3 === 'number') {
    statusCode = param3;
    if (typeof param4 === 'object' && param4 !== null) {
      extra = param4;
    }
  } else if (typeof param3 === 'string') {
    message = param3;
    if (typeof param4 === 'number') {
      statusCode = param4;
    } else if (typeof param4 === 'object' && param4 !== null) {
      extra = param4;
    }
  } else if (typeof param3 === 'object' && param3 !== null) {
    extra = param3;
  }

  const responseBody = {
    success: true,
    data,
    ...(message ? { message } : {}),
    ...extra
  };

  return res.status(statusCode).json(responseBody);
};

export const sendError = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

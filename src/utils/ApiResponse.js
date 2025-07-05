const ResponseData = (res, { statusCode, status = "success", data, message }) => {
    const response = {
        status,
        message,
        data
    }

    return res.status(statusCode).json(response);
};

export default ResponseData;
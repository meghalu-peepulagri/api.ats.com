const notFound = (c) => {
    return c.json({
        status: "NOT_FOUND",
        message: `${"NOT_FOUND_MESSAGE"} - ${c.req.path}`,
    }, 404);
};
export default notFound;

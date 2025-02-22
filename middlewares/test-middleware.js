module.exports = function(req, res, next) {
    try {
        console.log('testMiddlare is starting...');
        console.log(req.headers);
        console.log(req.body);
        const props = Object.keys(req);
        console.log(props);
        // console.log(req.req);
        console.log('testMiddlare is canceling...');

        next();
    } catch (err) {
        next(err);
    }
}
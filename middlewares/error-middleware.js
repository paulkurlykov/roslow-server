const ApiError = require('../exceptions/api-errors');

module.exports = function (err, req, res, next) {
if(err instanceof ApiError) {
    // console.log('inside error middleware');
    return res.status(err.status).json({message: err.message, errors: err.errors});
}
// console.log('error is not defined!');
return res.status(500).json({message: "Непредвиденная ошибка"})
}
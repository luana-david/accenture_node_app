function log(req, res, next) {
    console.log('log...');
    next();
}

module.exports = log;
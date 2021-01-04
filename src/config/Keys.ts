module.exports = process.env.NODE_ENV === 'production' ?
    (require('./KeysProd.ts')) : (require('./KeysDev.ts'));
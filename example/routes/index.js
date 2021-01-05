/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const express = require('express')
const users = require('./users')
const router = express.Router()

router.use('/users', users)

module.exports = router;

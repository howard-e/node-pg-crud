/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const express = require('express')
const httpStatus = require('http-status-codes')
const { UserModel } = require('../../models')
const { validate, validateRules } = require('./validator')

const router = express.Router()

router.get('/', validateRules('getUsers'), validate, async (req, res) => {
    const { search, filter } = req.query;
    const { page, limit, sort } = req.query;

    try {
        const result = await UserModel.get({ search, filter }, { page, limit, sort });
        res.send(result);
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message });
    }
})

router.get('/:id', (req, res) => {

})

router.post('/', (req, res) => {

})

router.put('/:id', (req, res) => {

})

router.delete('/:id', (req, res) => {

})

module.exports = router;

/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const express = require('express')
const httpStatus = require('http-status-codes')
const { UserModel } = require('../../models')
const { validate, validateRules } = require('./validator')

const router = express.Router()

router.get('/', validateRules('getUsers'), validate, async (req, res) => {
    const { search, filter } = req.query
    const { page, limit, sort } = req.query

    try {
        const result = await UserModel.get({ search, filter }, { page, limit, sort })
        res.send(result)
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message })
    }
})

router.get('/:id', validateRules('getUserById'), validate, async (req, res) => {
    const { id } = req.params

    try {
        const result = await UserModel.getById(id)
        res.send(result)
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message })
    }
})

router.post('/', validateRules('createUser'), async (req, res) => {
    const params = req.body

    try {
        const result = await UserModel.insert(params)
        res.send(result)
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message })
    }
})

router.put('/:id', validateRules('updateUser'), async (req, res) => {
    const { id } = req.params
    const params = req.body

    try {
        const result = await UserModel.update(id, params)
        res.send(result)
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message })
    }
})

router.delete('/:id', validateRules('deleteUser'), async (req, res) => {
    const { id } = req.params

    try {
        const result = await UserModel.remove(id)
        res.status(httpStatus.NO_CONTENT).send()
    } catch (error) {
        // log error
        return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: error.message })
    }
})

module.exports = router

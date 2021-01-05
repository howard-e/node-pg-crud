/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const httpStatus = require('http-status-codes')
const { body, param, query, validationResult } = require('express-validator')

const validate = (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) return next()
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({ errors: errors.array({ onlyFirstError: true }) })
}

const validateRules = (method) => {
    switch (method) {
        case 'getUsers': {
            return [
                query('page').if(query('page').exists()).toInt().customSanitizer(value => value - 1),
                query('limit').if(query('limit').exists()).toInt(),
                // query('search').if(query('search').exists()).customSanitizer(value => new RegExp(value, 'i'))
            ]
        }
        case 'getUserById': {
            return [
                param('id', 'User Id Missing').notEmpty().toInt()
            ]
        }
        case 'updateUser': {
            return [
                param('id', 'User Id Missing').notEmpty().toInt()
            ]
        }
        case 'deleteUser': {
            return [
                param('id', 'User Id Missing').notEmpty().toInt()
            ]
        }
        default:
            return null
    }
}

module.exports = {
    validate,
    validateRules
}

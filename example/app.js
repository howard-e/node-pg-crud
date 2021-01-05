/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')

const port = 4040
const app = express()

// body-parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', routes)

app.listen(port, () => {
    console.log(`node-pg-crud example app listening at http://localhost:${port}`)
})

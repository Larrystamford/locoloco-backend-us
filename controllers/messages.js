const Messages = require("../models/messages");


module.exports = {
    create: async (req, res, next) => {
        const message = req.body

        Messages.create(message, (err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(201).send(`new message created: ${data}`)
            }
        })
    },

    list: async (req, res, next) => {
        Messages.find((err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(data)
            }
        })
    },

    get: async (req, res, next) => {
        const queryList = req.params.query.split("&")
        const sender = queryList[0].toLowerCase()
        const receiver = queryList[1].toLowerCase()

        Messages.find({
            "sender": sender,
            "receiver": receiver
        }, (err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(data)
            }
        })
    },

}
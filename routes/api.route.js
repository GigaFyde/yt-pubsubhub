const router = require('express').Router();
const {PrismaClient} = require('@prisma/client')
const manager = require('./../manager')
const prisma = new PrismaClient();

router.post('/subscribe', async (req, res, next) => {
    let body = JSON.parse(req.body)
    let topic = body.topic
    let callbackUrl = body.callbackUrl

    console.log("received new subscribe request")

    const sub = await prisma.subscriptions.create({
        data: {
            topic: topic,
            callbackUrl: callbackUrl,
        }
    })
    const id = sub.id;
    
    manager.refreshSubscription(id, callbackUrl, topic)

    res.status(200).send()
})

module.exports = router;

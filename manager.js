const {PrismaClient} = require('@prisma/client')
const moment = require('moment');
const prisma = new PrismaClient();
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Schedule tasks to be run on the server.
function startCronScheduler() {
    console.log("Starting scheduler")
    cron.schedule('0 0 * * *', function () {
        retrieveSubscriptions()
    });
}

async function retrieveSubscriptions() {
    const currentTime = moment();
    const modifiedTime = currentTime.subtract(1, 'day');

    const subscriptions = await prisma.subscriptions.findMany()
    subscriptions.forEach(sub => {
        if (sub.expiresAt < modifiedTime) {
            console.log("starting refresh on " + sub.topic)
            refreshSubscription(sub.id, sub.callbackUrl, sub.topic)
        }
    })
}

async function updateSubscriptionExpiry(id) {
    const currentTime = moment();
    const modifiedTime = currentTime.add(7, 'day');
    await prisma.subscriptions.update({
        where: {
            id: id
        },
        data: {
            expiresAt: modifiedTime.format()
        },
    }).then(console.log("updated database record successfully"))
}

async function refreshSubscription(id, callback, topic) {
    let req = await fetch('https://pubsubhubbub.appspot.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'hub.callback': callback,
            'hub.mode': 'subscribe',
            'hub.topic': topic,
            'hub.lease_seconds': 604800
        })
    });
    if (req.status === 202) {
        console.log("refresh succeeded")
        await updateSubscriptionExpiry(id)
    } else {
        console.error("refresh failed")
    }
}

module.exports = {startCronScheduler, refreshSubscription}

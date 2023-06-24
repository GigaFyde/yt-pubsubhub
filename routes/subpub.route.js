const router = require('express').Router();
const {XMLParser} = require("fast-xml-parser");
const {PrismaClient} = require('@prisma/client')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
    if (req.query["hub.challenge"]) {
        console.log("we got a hub challenge!")
        res.status(200).send(req.query["hub.challenge"])
    } else {
        res.status(444).send()
    }
});

router.post('/', async (req, res, next) => {
    const parser = new XMLParser();
    const json = parser.parse(req.body);
    if (json.feed["at:deleted-entry"]) {
        console.log("deleted video")
        res.status(200).send()
        return
    }
    if (json.feed.entry) {
        console.log("new incoming video")
        if (!await checkWhetherVideoIsAlreadyPosted(json)) {
            await sendDiscordWebhook(json)
        }
    } else {
        res.status(200).send()
    }
    res.status(200).send()
})



async function checkWhetherVideoIsAlreadyPosted(json) {
    const videoExists = await prisma.videos.findUnique({
        where: {
            videoId: json.feed.entry["yt:videoId"]
        }
    })

    if (videoExists === null) {
        console.log("video did not yet exist, now saving")
        await prisma.videos.create({
            data: {
                videoId: json.feed.entry["yt:videoId"]
            }
        })
        return false
    }
    if (videoExists) {
        console.log("video already exists")
        return true
    }
}

async function sendDiscordWebhook(json) {
    let url = `https://www.youtube.com/watch?v=${json.feed.entry["yt:videoId"]}`
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({
            "content": url,
            "embeds": null,
            "username": "Youtube Push Notification",
            "avatar_url": "https://b2.gigafyde.net/file/gify-file/2023/05/20/youtube-512-289233.png",
            "attachments": []
        })
    })
}

module.exports = router;

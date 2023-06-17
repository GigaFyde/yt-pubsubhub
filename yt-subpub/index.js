const express = require('express')
const app = express()
const port = 8080
const bodyParser = require('body-parser')
const manager = require('./manager')

const rawLimit = process.env.MAX_RAW_SIZE

app.use(bodyParser.raw({ type: '*/*' , limit: rawLimit }))
app.disable('x-powered-by');

app.use('/', require('./routes/subpub.route'));
app.use('/api', require('./routes/api.route'));

manager.startCronScheduler()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

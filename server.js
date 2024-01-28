const express = require('express');
require('dotenv').config();
const { readdirSync } = require('fs');
const cors = require('cors');

const app = express();
// const port = process.env.PORT || 4000; 
const port = 3000;

app.use(express.json());
app.use(cors());

//Router
readdirSync('./Routers').map((r) => app.use('/ApiRouters', require('./Routers/' + r)))

app.use("/paymentImage", express.static('./uploadPayment'));
app.use("/userImage", express.static('./userImage'));
app.use("/imageReview", express.static('./imageReview'));

app.listen(port, () => console.log(`Server runing on port ${port}`))
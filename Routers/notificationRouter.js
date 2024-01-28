const puhsNotificationController = require('../notification/controller/pushNotification.controller')

const express = require('express')
const router = express.Router()



router.get('/SendMessage', puhsNotificationController.SendNotification);
router.post('/SendMessageDevice', puhsNotificationController.SendNotificationToDevice);

module.exports = router
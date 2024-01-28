const { ONE_SIGNAL_CONFIG } = require('../../configs/notification_config')
const puhsNotificationSevice = require('../pushNotification');

console.log(ONE_SIGNAL_CONFIG.APP_ID)
exports.SendNotification = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: { en: "บริษัทเรือนำเที่ยวกำลังออกไปรับท่าน กรุณาตอบรับการติดต่อเมื่อเจ้าหน้าที่ติดต่อ" },
            included_segments: ["All"],
            content_available: true,
            small_icon: "ic_notification_icon",
            data: {
                PushTitle: "Custom Notification"
            }
    }

    puhsNotificationSevice.SendNotification(message, (err, results) => {
        if(err) {
            return next(err);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })
}


exports.SendNotificationToDevice = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: { en: "Test Push Notification"},
            included_segments: ["included_player_ids"],
            include_player_ids: req.body.devices,
            content_available: true,
            small_icon: "ic_notification_icon",
            data: {
                PushTitle: "Custom Notification"
            }
    }

    puhsNotificationSevice.SendNotification(message, (err, results) => {
        if(err) {
            return next(err);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })
}
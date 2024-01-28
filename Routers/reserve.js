const express = require('express');
const router = express.Router();
const conn = require('../configs/dbMysql');
const getConn = require('../configs/dbMysql2');
const fs = require("fs-extra");
const crypto = require('crypto');

//upload file
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'Images')
    },
    filename: (req, file, callback) => {
        console.log(file)
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

router.post('/reserve', (req, res) => {
    const {userID,firstName,lastName,email,packID,dateTravel,phone_number,quantity_adult,quantity_child,total_price,location_hotel} = req.body;

    try{
        conn.query('INSERT INTO reserve(userID,firstName,lastName,email,packID,date_travel,Phone_number,quantity_adult,quantity_child,total_price,location_hotel) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
        [userID,firstName,lastName,email,packID,dateTravel,phone_number,quantity_adult,quantity_child,total_price,location_hotel],
        (err, resulte, fields) => {
            if(err) {
                console.log(`error insert data : ${err}`);
                return res.status(400).json({message: `error insert data : ${err}`});
            }
            return res.status(201).json({message: 'insert data success', body: resulte});
        })
    }catch(err){
        console.log(err)
    }
})

router.post('/reserveCharter', (req, res) => {
    const {userID, firstName, lastName, email, packID, dateTravel, phone_number, total_price, location_hotel} = req.body;

    try{
        conn.query('INSERT INTO reserve(userID,firstName,lastName,email,packID,date_travel,Phone_number,total_price,location_hotel) VALUES(?,?,?,?,?,?,?,?,?)',
        [userID, firstName, lastName, email, packID, dateTravel, phone_number, total_price, location_hotel],
        (err, result, fields) => {
            if(err){
                console.log(`error insert data : ${err}`);
                return res.status(400).json({message: `error insert data : ${err}`});
            }
            res.status(201).json({message: `insert data success`, body: result})
        })
    }catch(err){
        console.log(err);
        res.status(500).send();
    }
})

router.get('/reservelist/:id', (req, res) => {
    id = req.params.id;
    try{
        conn.query("SELECT * FROM ((reserve INNER JOIN packages ON reserve.packID = packages.packID) INNER JOIN provinces ON packages.location = provinces.id) WHERE userID = ? ORDER BY reserveID DESC",
        [id],
        (err, resulte, fields) => {
            if(err){
                console.log(`Select data error : ${err}`)
                return res.status(400).json({message: 'Select data error : ${err}'})
            }
            res.status(200).json(resulte)
        })
    } catch(err) {
        console.log(err)
        return res.status(500).send()
    }
})


router.post('/reserveCancel', (req, res) => {
    const { reserveID } = req.body;
    try {
        conn.query("DELETE FROM reserve WHERE reserveID = ?",
        [reserveID],
        (err, result, fields) => {
            if(err) {
                console.log(err)
                return res.status(400).json({message: `delete error : ${err}`})
            }
            res.status(200).json({message: `delete success`, body: result})
        })
    } catch(err) {
        console.log(err)
        res.status(500).send()
    }
})

router.post('/uploadImagePayment', async (req, res) => {
    var readFile = Buffer.from(req.body.image, "base64")
    fs.writeFileSync(req.body.finalName,readFile,"utf8")
    var files = req.body.finalName
    var reserveID = req.body.reserveID
    var randomFilename = crypto.randomBytes(20).toString('hex');
    var fileName = randomFilename+'_'+files
    
    try{
        //use move file
        await fs.rename(`./${files}`, `./uploadPayment/${fileName}` , (err) => {
            if (err) return console.log(err)
            console.log(`move file success : ${fileName}`)
            console.log(`reserveID : ${reserveID}`)
        })

        conn.query("UPDATE reserve SET image_payment = ? WHERE reserveID = ?",
        [fileName, reserveID],
        (err, result, fields) => {
            if(err){
                console.log(`Update data err : ${err}`)
                return res.status(400).json({message: `Update data err : ${err}`})
            }
            res.status(200).json(result)
            console.log(result)
        })
    }catch(err){
        console.log(err)
        res.status(500).send()
    }
})


router.post('/cancelBooking', (req, res) => {
   const { reserveID, bankName, bankNumber, bankFristLastName } = req.body;
   try{
        conn.query("UPDATE reserve SET status_cancel = '1', bank_name = ?, bank_number = ?, bank_FirstLast_name = ? WHERE reserveID = ?",
        [ bankName, bankNumber, bankFristLastName , reserveID ],
        (err, result, fields) => {
            if(err) {
                console.log(`update data err : ${err}`)
                return res.status(400).json({message: `update data err : ${err}`})
            }
            res.status(200).json({message: `update data success`, body: result})
        })
   } catch(err) {
        console.log(err)
        return res.status(500).send()
   }
})

module.exports = router
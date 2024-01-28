const express = require('express');
const router = express.Router();
const getConn = require('../configs/dbMysql2');
const conn = require('../configs/dbMysql');
const path = require('path')
const fs = require('fs-extra')
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

router.get('/userGetOrder/:id', async (req, res) => {
    const id = req.params.id;
    try{
        conn.query("SELECT * FROM users WHERE userID = ?",
        [id],
        (err, results, fields) => {
            console.log(id)
            if(err){
                console.log(err)
                return res.status(400).json({message: `Select data error : ${err}`})
            }
            res.status(200).json({message: 'Select data success', body: results})
        })
    } catch(err) {
        console.log(err)
        return res.status(500).send();
    }
})



router.post('/updateProfile', async (req, res) => {
    var readFile = Buffer.from(req.body.image, "base64")
    fs.writeFileSync(req.body.fileName,readFile,"utf8")
    var files = req.body.fileName
    var userID = req.body.userID
    var randomFilename = crypto.randomBytes(20).toString('hex');
    var fileName = randomFilename+'_'+files
    
    try{
        //use move file
        await fs.rename(`./${files}`, `./userImage/${fileName}` , (err) => {
            if (err) return console.log(err)
            console.log(`move file success : ${fileName}`)
            console.log(`reserveID : ${userID}`)
        })

        conn.query("UPDATE users SET user_image = ? WHERE userID = ?",
        [fileName, userID],
        (err, result, fields) => {
            if(err){
                console.log(`Update data error : ${err}`)
                return res.status(400).json({message: `Update data error : ${err}`})
            }
            res.status(200).json({message: 'Update data success', body: result})
        })
    }catch(err){
        console.log(err)
        res.status(500).send()
    }
})


router.post('/Editprofile', (req, res) => {
    const {firsName, lastName, email, phoneNumber, userID } = req.body;
    try{
        conn.query("UPDATE users SET name = ?, lastName = ?, Email = ?, Tel = ? WHERE userID = ?",
        [firsName , lastName, email, phoneNumber, userID],
        (err, result, fields) => {
            if(err) {
                console.log(`update data err : ${err}`)
                return res.status(400).json({message: `update data err : ${err}`})
            }
            res.status(200).json({message: `update data success`, body: result})
        })
    } catch(err) {
        console.log(err)
        res.status(500).send
    }
})

module.exports = router
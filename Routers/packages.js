const express = require('express');
const router = express.Router();
const conn = require('../configs/dbMysql')
const getConn = require('../configs/dbMysql2')
const fs = require('fs-extra')
const crypto = require('crypto')

router.get("/selectpackages", async(req, res) => {
    try{
        conn.query("SELECT packages.*, packagestype.packagesTypename, provinces.* FROM ((packages INNER JOIN packagestype ON packages.packtypeID = packagestype.packagesTypeId) INNER JOIN provinces ON packages.location = provinces.id) WHERE status=1 AND image IS NOT NULL ORDER BY RAND()", (err, results, fields) => {
            if(err){
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        });
    }catch(err){
        return res.status(500).send();
    }
})


router.get('/quantitybook/:id', (req, res) => {
    const id = req.params.id;
    try{
        conn.query("SELECT COUNT(reserveID) AS quantity FROM `reserve` WHERE packID = ?",
        [id],
        (err, results, fields) => {
            if(err){
                console.log(err);
                return res.status(400).json({message: `Select data error : ${err}`})
            }
            res.status(200).json({message : 'Select data success', body: results})
        })
    } catch(err) {
        console.log(err)
        return res.status(500).send();
    }
})

router.post('/reviewPackage', async (req, res) => {
    const {packID, userID, star, comment, image, fileName} = req.body

    if (image == undefined || fileName == undefined) {
        try{
            conn.query("INSERT INTO comments(pack_ID, user_ID, stars, comDeteil) VALUES(?,?,?,?)",
            [packID, userID, star, comment],
            (err, result, fields) => {
                if(err){
                    console.log(err)
                    return res.status(400).json({message: `insert data err : ${err}`})
                }
                res.status(201).json({message: 'insert data success', body: result})
            })
        } catch(err) {
            console.log(err)
            return res.status(500).json(err)
        }
    } else {
        var readFile = Buffer.from(image, "base64")
        fs.writeFileSync(fileName,readFile,"utf8")
        var randomFilename = crypto.randomBytes(20).toString('hex');
        var fileNameCripto = randomFilename+'_'+fileName

        try{
            //use move file
            await fs.rename(`./${fileName}`, `./imageReview/${fileNameCripto}` , (err) => {
                if (err) return console.log(err)
                console.log(`move file success : ${fileNameCripto}`)
                console.log(`UserID : ${userID}`)
            })

            conn.query("INSERT INTO comments(pack_ID, user_ID, stars, comDeteil, image_review) VALUES(?,?,?,?,?)",
            [packID, userID, star, comment, fileNameCripto],
            (err, result, fields) => {
                if(err){
                    console.log(err)
                    return res.status(400).json({message: `insert data err : ${err}`})
                }
                res.status(201).json({message: 'insert data success', body: result})
            })
        } catch(err) {
            console.log(err)
            return res.status(500).json(err)
        }
    }
})

router.get('/selectReview', (req, res) => {
    try{
        conn.query("SELECT CONCAT(name,' ',lastName) AS nameConcat, packages.*, comments.*, users.*, packagestype.*, provinces.* FROM ((((comments INNER JOIN packages ON comments.pack_ID = packages.packID) INNER JOIN users ON comments.user_ID = users.userID)INNER JOIN packagestype ON packages.packtypeID = packagestype.packagesTypeId) INNER JOIN provinces ON packages.location = provinces.id) ORDER BY review_date DESC",
        (err, result, fields) => {
            if(err){
                console.log(err)
                return res.status(400).json({message: `select data err : ${err}`})
            }
            res.status(200).json({message: 'select data success', body: result})
        })
    } catch(err) {
        console.log(err)
        return res.status(500).send()
    }
})


router.get('/promotionPack/:packid', async (req, res) => {
    const id = req.params.packid
    
    try{
        conn.query("SELECT * FROM promotion_package INNER JOIN packages ON promotion_package.packID = packages.packID WHERE packages.packID = ? AND promotionStart_date <= CURRENT_DATE() AND CURRENT_DATE() <= promotionEnd_date",
        [id],
        (err, result, fields) => {
            if (err) {
               console.log(`Select data err : ${err}`)
               return res.status(400).json({message: `Select data err : ${err}`}) 
            }
            if (result.length === 0) {
                res.status(400).json({message: `not promotion`})
            } else {
                res.status(200).json({message: `Select data success`, body: result})
            }
            
        })
    } catch(err) {
        console.log(err)
        res.status(500).send()
    }
})

router.get('/packageSale', (req , res) => {
    try{
        conn.query("SELECT packages.*, packagestype.packagesTypename, provinces.*, promotion_package.* FROM (((packages INNER JOIN packagestype ON packages.packtypeID = packagestype.packagesTypeId) INNER JOIN provinces ON packages.location = provinces.id) INNER JOIN promotion_package ON packages.packID = promotion_package.packID) WHERE status=1 AND image IS NOT NULL AND promotionStart_date <= CURRENT_DATE() AND CURRENT_DATE() <= promotionEnd_date ORDER BY RAND()",
        (err, result, fields) => {
            if(err) {
                console.log(`select data err : ${err}`)
                return res.status(400).json({message: `select data err : ${err}`})
            }
            res.status(200).json(result)
        })
    }catch(err){
        console.log(err)
        res.status(500).send()
    }
})

router.get('/selectProvice', (req, res) => {
    try{
        conn.query("SELECT provinces.id, provinces.name_en FROM provinces INNER JOIN packages ON provinces.id = packages.location WHERE status = '1' GROUP BY packages.location",
        (err, result, fields) => {
            if(err){ 
                console.log(`select data err : ${err}`)
                return res.status(400).json({message: `select data err : ${err}`})
            }
            res.status(200).json(result)
        })
    } catch(err) {
        console.log(err)
        return res.status(500).send()
    }
})

router.get('/selectpackProvice/:id', (req, res) => {
    const id = req.params.id
    try{
        conn.query("SELECT packages.*, packagestype.packagesTypename, provinces.* FROM ((packages INNER JOIN packagestype ON packages.packtypeID = packagestype.packagesTypeId) INNER JOIN provinces ON packages.location = provinces.id) WHERE status=1 AND image IS NOT NULL AND packages.location = ? ORDER BY RAND();",
        [id],
        (err, result, fields) => {
            if(err) {
                console.log(`select data err : ${err}`)
                return res.status(400).json({message:`select data err : ${err}`})
            }
            res.status(200).json(result)
        })
    } catch(err) {
        console.log(err)
        res.status(500).send()
    }
})



module.exports = router
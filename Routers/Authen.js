const express = require('express');
const router = express.Router();
const getConn = require('../configs/dbMysql2');
const conn = require('../configs/dbMysql');
const bcrypt = require('bcrypt');


router.post("/createUser", async (req, res) => {
    const {name,lastName,tell,email,password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    try {
        const [rows, fields] = await getConn.execute("SELECT COUNT(*) as MyCount FROM `users` WHERE Email = ?",[email]);
        const MyCount = rows[0].MyCount
        console.log(`Email count : ${MyCount}`)
        if(MyCount > 0) {
            return res.status(404).json({message: `Error new user : ${email} => ${MyCount}`})
        } else {
            console.log([name,lastName,tell,email,hashPassword])
            conn.query(
                "INSERT INTO users(name,lastName,Tel,password,Email) VALUES(?, ?, ?, ?, ?)",
                [name,lastName,tell,hashPassword,email],
                (err, results, fields) => {
                    if(err) {
                        console.log(`Error Insert Into database ${err}`)
                        return res.status(400).send();
                    }
                    return res.status(201).json({message: "Create new user successfully!"})
                }
            )
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    
    const lowerEmail = email.toLowerCase();
    console.log(lowerEmail);

    try{
        conn.query("SELECT *, LOWER(Email) AS lowerEmail FROM `users` WHERE LOWER(Email) = ?",
        [lowerEmail],
        (err, users, fields) => {
            console.log(users.length);
            if(err) {
                console.log(`Error Chenk login ${err}`)
                return res.status(400).send();
            }

            if(users.length == 0){ 
                console.log(`No user found`)
                return res.status(400).send();
            }

            bcrypt.compare(password, users[0].password, (err, isLogin) => {
                if(isLogin){
                    return res.status(201).json({message: "user Login successfully!", body: users})
                } else {
                    return res.status(404).json({message: "user Login failed!"})
                }
            })
         })
    }catch(err){
        console.log(err)
        return res.status(500).send();
    }

});

router.post('/googleAuth', (req, res) => {
    const {name, email, UID, image} = req.body;
    const lowerEmail = email.toLowerCase();
    try{
        conn.query("SELECT name, Email, google_UID , image, COUNT(Email) AS countEmail FROM users WHERE LOWER(Email) = ?",
        [email],
        (err, resulte, fields) => {
            emailCount = resulte[0].countEmail
            console.log(emailCount);

            if(emailCount > 0){
                return res.status(200).json({message: "user signin success", body: resulte})
            }
                conn.query("INSERT INTO users(name, email, google_UID, image) VALUES(?,?,?,?)",
                [name, email, UID, image],
                (err, results, fields) => {
                    if(err){
                    console.log(err)
                    return res.status(404).send();
                    }
                    return res.status(201).json({message: "Insert UserData with google success", body: results});
                }
                )
            }
        )
    }catch(err){
        res.status(500).send(err);
    }
})





module.exports = router
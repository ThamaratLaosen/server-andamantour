const mysql = require('mysql');
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;

//Mysql Connect
const conn = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    port: dbPort
})

conn.connect((err) => {
    if(err){
        console.log(`Error connect to Mysql => ${err}`)
        return;
    }
    console.log('Mysql successfully connect')
})


module.exports = conn;
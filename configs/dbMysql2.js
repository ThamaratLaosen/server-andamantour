const mysql2 = require('mysql2');
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;

const getConn = mysql2.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    port: dbPort
})

getConn.getConnection((err) => {
    if(err){
        console.log(`Error connect to Mysql2 => ${err}`)
        return;
    }
    console.log('Mysql2 successfully connect')
})

module.exports = getConn.promise();
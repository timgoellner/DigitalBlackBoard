/*
DATABASE COLUMN SETUP

 * accounts
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - identifier (varchar(45) [nn])
    - password (varchar(45))
    - isStaff (boolean [nn])
*/

if (process.env.NODE_ENV !== "production") { require("dotenv").config() }
const mysql = require("mysql2")

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

async function sendQuery(query) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            connection.query(query, function(error, rows, fields) {
                if (error) console.log("[mysql] error: " + error)
                resolve(rows)
            })
        }, 0);
    });
}

module.exports = { sendQuery }
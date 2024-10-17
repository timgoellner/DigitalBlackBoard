/*
DATABASE TABLE SETUP

|| BASICS

 * organizations
    - id (int [pk, nn, uq, ai])
    - name (varchar(45) [nn])
    - quarantine (boolean [nn])
    - news (varchar(150))

 * accounts
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - identifier (varchar(45) [nn])
    - password (varchar(72))
    - isStaff (boolean [nn])

 * grades
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - grade (varchar(5) [nn])
    - subgrades (varchar(1))
    - hasSubgrade (boolean [nn])

 * teachers
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - forename (varchar(45) [nn])
    - lastname (varchar(45) [nn])

 * students
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - account (int [fk, nn])
    - forename (varchar(45) [nn])
    - lastname (varchar(45) [nn])
    - grade (int [fk, nn])

 * classes
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - name (varchar(45) [nn])
    - weekday (varchar(20) [nn])
    - startTime (time [nn])
    - duration (int [nn])
    - teacher (int [fk, nn])
    - subject (int [fk, nn])
    - room (int [fk, nn])
    - grade (int [fk, nn])
    - usesGrade (boolean [nn])

 * changes
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - type (int [nn])
    - class (int [fk, nn])
    - teacher (int [fk])
    - room (int [fk])
    - subject (int [fk])
    - information (varchar(100))

|| CONNECTIONS

 * student_classes
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - student (int [fk, nn])
    - class (int [fk, nn])

 * teacher_subjects
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - teacher (int [fk, nn])
    - subject (int [fk, nn])

|| SMALLS

 * subjects
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - name (varchar(45) [nn])

 * rooms
    - id (int [pk, nn, uq, ai])
    - organization (varchar(45) [nn])
    - name (varchar(45) [nn])
*/

if (process.env.NODE_ENV !== "production") { require("dotenv").config() }
import mysql_lib, { RowDataPacket, ResultSetHeader } from "mysql2";

const pool = mysql_lib.createPool({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE_NAME
})

async function sendQuery(query: string): Promise<RowDataPacket[] | ResultSetHeader> {
   return new Promise(function(resolve, reject) {
      setTimeout(function() {
         pool.query(query, (error: string, result: RowDataPacket[] | ResultSetHeader) => {
            if (error) {
               console.log("[mysql] error: " + error)
               reject(error)
            }
            resolve(result)
         })
      }, 0);
   });
}

export default sendQuery

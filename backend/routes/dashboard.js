const express = require('express')

const mysql = require("../helpers/mysql");
const validateUser = require("../helpers/validateUser")

const router = express.Router()

router.get("/grades", async (request, response) => {
  const user = validateUser(request);
  if (!user || !user.isStaff) return response.status(401).json({ message: 'error' })
  
  const grades = await mysql.sendQuery(`SELECT * FROM grades WHERE organization = '${user.organization}'`);
  console.log(grades)
  return response.status(200).json({message: 'success', grades})
})

module.exports = router
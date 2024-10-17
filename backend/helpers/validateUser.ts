import { Request } from 'express'

import jwt from 'jsonwebtoken'
import sendQuery from './mysql'
import { RowDataPacket } from 'mysql2'
const esc = require("mysql2").escape

type User = {
  signInTime: Date,
  organization: string,
  identifier: string,
  isStaff: boolean
}

async function validateUser(request: Request) {
  const jwtSecretKey = process.env.JWT_SECRET as string
  const token = request.headers['jwt-token'] as string
  try {
    const user = jwt.verify(token, jwtSecretKey) as User

    if (user && !user.isStaff) {
      const quarantine = await sendQuery(`SELECT * FROM organizations WHERE name = ${esc(user.organization)}`) as RowDataPacket[]
      if (quarantine[0].quarantine === 1) return false
    }

    return (user) ? user : false
  } catch (error) {
    return false;
  }
}

export default validateUser
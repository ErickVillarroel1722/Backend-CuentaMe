import jwt from 'jsonwebtoken'

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET

// JWT generation in base of ID + USER ROL
const generateJWT = (id, rol) => {
  return jwt.sign(
    {id, rol},
    JWT_SECRET,
    {expiresIn: 'id'}
  )
}

export default generateJWT

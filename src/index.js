import app from './server/server.js'
import connection from './database/database.js'

// Database connection
connection()

// Port Listening for Backend initializing
app.listen(app.get('port'), ()=>{
  console.log("\n-----------------------------------------------------------------------")
  console.log(`Cuenta-Me Backend server has initialized on port: ${app.get('port')}`)
  console.log(`Backend links is: http://localhost:${app.get('port')}`)
})

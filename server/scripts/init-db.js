const dotenv = require('dotenv')
const { connectDb, initDb } = require('../src/db')

dotenv.config()

connectDb()
  .then(() => initDb())
  .then(() => {
    console.log('Database schema initialized')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database schema init failed:', error.message)
    process.exit(1)
  })

const { Pool } = require('pg')

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: String(process.env.DB_USER || ''),
  password: String(process.env.DB_PASSWORD || ''),
  ssl: process.env.DB_SSL === 'true'
}

const databaseName = process.env.DB_NAME

if (!databaseName) {
  throw new Error('DB_NAME is required')
}

const isValidDbName = /^[a-zA-Z0-9_]+$/.test(databaseName)

if (!isValidDbName) {
  throw new Error('DB_NAME must be alphanumeric with underscores only')
}

const pool = new Pool({
  ...baseConfig,
  database: databaseName
})

const connectDb = async () => {
  try {
    const client = await pool.connect()
    try {
      await client.query('SELECT 1')
    } finally {
      client.release()
    }
  } catch (error) {
    if (error.code === '3D000') {
      const adminPool = new Pool({
        ...baseConfig,
        database: 'postgres'
      })

      try {
        await adminPool.query(`CREATE DATABASE ${databaseName}`)
      } catch (createError) {
        if (createError.code !== '42P04' && createError.code !== '23505') {
          throw createError
        }
      } finally {
        await adminPool.end()
      }

      return connectDb()
    }

    throw error
  }
}

module.exports = {
  pool,
  connectDb
}

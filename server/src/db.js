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

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_time TIMESTAMP NOT NULL DEFAULT NOW(),
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT '주문 접수'
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_id INTEGER NOT NULL REFERENCES menus(id),
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_item_options (
      id SERIAL PRIMARY KEY,
      order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
      option_id INTEGER NOT NULL REFERENCES options(id)
    )
  `)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM menus')
  if (rows[0].count === 0) {
    const seedMenus = [
      {
        name: '아메리카노(ICE)',
        description: '간단한 설명...',
        price: 4000,
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop',
        stock: 10
      },
      {
        name: '아메리카노(HOT)',
        description: '간단한 설명...',
        price: 4000,
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
        stock: 10
      },
      {
        name: '카페라떼',
        description: '간단한 설명...',
        price: 5000,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
        stock: 10
      }
    ]

    for (const menu of seedMenus) {
      const insertMenu = await pool.query(
        'INSERT INTO menus (name, description, price, image, stock) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [menu.name, menu.description, menu.price, menu.image, menu.stock]
      )
      const menuId = insertMenu.rows[0].id
      await pool.query(
        'INSERT INTO options (menu_id, name, price) VALUES ($1, $2, $3), ($1, $4, $5)',
        [menuId, '샷 추가', 500, '시럽 추가', 0]
      )
    }
  }
}

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
  connectDb,
  initDb
}

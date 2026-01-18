const express = require('express')
const { pool } = require('../db')

const router = express.Router()

router.post('/', async (req, res) => {
  const { items, totalPrice } = req.body

  if (!Array.isArray(items) || items.length === 0 || typeof totalPrice !== 'number') {
    return res.status(400).json({ message: '주문 정보가 올바르지 않습니다.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query(
      'INSERT INTO orders (total_price, status) VALUES ($1, $2) RETURNING id, status',
      [totalPrice, '주문 접수']
    )

    const orderId = orderResult.rows[0].id

    for (const item of items) {
      const { menuId, selectedOptions, quantity } = item

      const menuResult = await client.query(
        'SELECT price, stock FROM menus WHERE id = $1',
        [menuId]
      )

      if (menuResult.rows.length === 0) {
        throw new Error('메뉴를 찾을 수 없습니다.')
      }

      const menuPrice = menuResult.rows[0].price
      const currentStock = menuResult.rows[0].stock

      if (currentStock < quantity) {
        throw new Error('재고가 부족합니다.')
      }

      const optionsResult = await client.query(
        'SELECT id, price FROM options WHERE menu_id = $1 AND id = ANY($2::int[])',
        [menuId, selectedOptions || []]
      )

      const optionsPrice = optionsResult.rows.reduce((sum, opt) => sum + opt.price, 0)
      const itemPrice = (menuPrice + optionsPrice) * quantity

      const orderItemResult = await client.query(
        'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING id',
        [orderId, menuId, quantity, itemPrice]
      )

      const orderItemId = orderItemResult.rows[0].id

      for (const optionId of selectedOptions || []) {
        await client.query(
          'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
          [orderItemId, optionId]
        )
      }

      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [quantity, menuId]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      orderId,
      status: orderResult.rows[0].status,
      message: '주문이 완료되었습니다.'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ message: error.message || '주문 생성 실패' })
  } finally {
    client.release()
  }
})

router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params

  try {
    const orderResult = await pool.query(
      'SELECT id, order_time, total_price, status FROM orders WHERE id = $1',
      [orderId]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
    }

    const itemsResult = await pool.query(
      `SELECT oi.id, oi.menu_id, m.name AS menu_name, oi.quantity, oi.price
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.id
       WHERE oi.order_id = $1`,
      [orderId]
    )

    const optionsResult = await pool.query(
      `SELECT oio.order_item_id, o.id, o.name, o.price
       FROM order_item_options oio
       JOIN options o ON oio.option_id = o.id
       WHERE oio.order_item_id = ANY($1::int[])`,
      [itemsResult.rows.map(row => row.id)]
    )

    const optionsByItem = optionsResult.rows.reduce((acc, option) => {
      if (!acc[option.order_item_id]) acc[option.order_item_id] = []
      acc[option.order_item_id].push({
        id: option.id,
        name: option.name,
        price: option.price
      })
      return acc
    }, {})

    const items = itemsResult.rows.map(item => ({
      menuId: item.menu_id,
      menuName: item.menu_name,
      quantity: item.quantity,
      selectedOptions: optionsByItem[item.id] || [],
      price: item.price
    }))

    res.json({
      id: orderResult.rows[0].id,
      orderTime: orderResult.rows[0].order_time,
      status: orderResult.rows[0].status,
      items,
      totalPrice: orderResult.rows[0].total_price
    })
  } catch (error) {
    res.status(500).json({ message: '주문 조회 실패' })
  }
})

module.exports = router

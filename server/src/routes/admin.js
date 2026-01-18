const express = require('express')
const { pool } = require('../db')

const router = express.Router()

router.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, stock FROM menus ORDER BY id'
    )
    res.json({ inventory: result.rows })
  } catch (error) {
    res.status(500).json({ message: '재고 조회 실패' })
  }
})

router.put('/inventory/:menuId', async (req, res) => {
  const { menuId } = req.params
  const { stock } = req.body

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ message: '재고 값이 올바르지 않습니다.' })
  }

  try {
    const result = await pool.query(
      'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING id, name, stock',
      [stock, menuId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '메뉴를 찾을 수 없습니다.' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: '재고 수정 실패' })
  }
})

router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, order_time, total_price, status FROM orders ORDER BY order_time DESC'
    )

    const orderIds = result.rows.map(order => order.id)
    let summaryRows = []
    if (orderIds.length > 0) {
      const summaryResult = await pool.query(
        `SELECT oi.order_id, m.name, oi.quantity
         FROM order_items oi
         JOIN menus m ON oi.menu_id = m.id
         WHERE oi.order_id = ANY($1::int[])`,
        [orderIds]
      )
      summaryRows = summaryResult.rows
    }

    const summaryByOrder = summaryRows.reduce((acc, row) => {
      if (!acc[row.order_id]) acc[row.order_id] = []
      acc[row.order_id].push(`${row.name} x ${row.quantity}`)
      return acc
    }, {})

    const orders = result.rows.map(order => ({
      id: order.id,
      orderTime: order.order_time,
      totalPrice: order.total_price,
      status: order.status,
      menuSummary: (summaryByOrder[order.id] || []).join(', ')
    }))

    res.json({ orders })
  } catch (error) {
    res.status(500).json({ message: '주문 목록 조회 실패' })
  }
})

router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params
  const { status } = req.body

  const allowed = ['주문 접수', '제조 중', '완료']
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: '상태 값이 올바르지 않습니다.' })
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, orderId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
    }
    res.json({ orderId: result.rows[0].id, status: result.rows[0].status })
  } catch (error) {
    res.status(500).json({ message: '주문 상태 수정 실패' })
  }
})

module.exports = router

const express = require('express')
const { pool } = require('../db')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const menusResult = await pool.query(
      'SELECT id, name, description, price, image, stock FROM menus ORDER BY id'
    )
    const optionsResult = await pool.query(
      'SELECT id, menu_id, name, price FROM options ORDER BY id'
    )

    const optionsByMenu = optionsResult.rows.reduce((acc, option) => {
      if (!acc[option.menu_id]) acc[option.menu_id] = []
      acc[option.menu_id].push({
        id: option.id,
        name: option.name,
        price: option.price
      })
      return acc
    }, {})

    const menus = menusResult.rows.map(menu => ({
      ...menu,
      options: optionsByMenu[menu.id] || []
    }))

    res.json({ menus })
  } catch (error) {
    res.status(500).json({ message: '메뉴 목록 조회 실패' })
  }
})

module.exports = router

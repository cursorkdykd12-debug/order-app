const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'API root' })
})

router.use('/menus', require('./menus'))
router.use('/orders', require('./orders'))
router.use('/admin', require('./admin'))

module.exports = router

import { useEffect, useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminPage from './components/AdminPage'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const INITIAL_INVENTORY = [
  { id: 1, name: '아메리카노(ICE)', stock: 10 },
  { id: 2, name: '아메리카노(HOT)', stock: 10 },
  { id: 3, name: '카페라떼', stock: 10 }
]

const INITIAL_ORDERS = [
  {
    id: 1,
    orderTime: '2024-07-31T13:00:00',
    menuSummary: '아메리카노(ICE) x 1',
    totalPrice: 4000,
    status: '주문 접수'
  }
]

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [menus, setMenus] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [inventoryItems, setInventoryItems] = useState(INITIAL_INVENTORY)
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [nextOrderId, setNextOrderId] = useState(INITIAL_ORDERS.length + 1)

  const getOptionsKey = (options) =>
    options.map(option => option.id).sort((a, b) => a - b).join('-')

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/menus`)
        const data = await response.json()
        setMenus(data.menus || [])
      } catch (error) {
        console.error('메뉴 로딩 실패', error)
      }
    }

    loadMenus()
  }, [])

  useEffect(() => {
    if (currentPage !== 'admin') return

    const loadAdminData = async () => {
      try {
        const [inventoryRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/inventory`),
          fetch(`${API_BASE}/api/admin/orders`)
        ])

        const inventoryData = await inventoryRes.json()
        const ordersData = await ordersRes.json()

        setInventoryItems(inventoryData.inventory || [])
        setOrders(ordersData.orders || [])
      } catch (error) {
        console.error('관리자 데이터 로딩 실패', error)
      }
    }

    loadAdminData()
  }, [currentPage])

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleAddToCart = (item) => {
    const itemKey = getOptionsKey(item.selectedOptions)
    // 같은 메뉴와 같은 옵션 조합이 있는지 확인
    const existingItemIndex = cartItems.findIndex(
      cartItem =>
        cartItem.menuId === item.menuId &&
        getOptionsKey(cartItem.selectedOptions) === itemKey
    )

    if (existingItemIndex !== -1) {
      // 기존 아이템의 수량 증가
      const updatedCart = [...cartItems]
      updatedCart[existingItemIndex].quantity += 1
      const basePrice = updatedCart[existingItemIndex].basePrice
      const optionsPrice = updatedCart[existingItemIndex].selectedOptions.reduce(
        (sum, opt) => sum + opt.price,
        0
      )
      updatedCart[existingItemIndex].totalPrice = (basePrice + optionsPrice) * updatedCart[existingItemIndex].quantity
      setCartItems(updatedCart)
    } else {
      // 새 아이템 추가
      const basePrice = item.basePrice
      const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
      const totalPrice = (basePrice + optionsPrice) * item.quantity

      setCartItems([...cartItems, { ...item, totalPrice }])
    }
  }

  const handleChangeQuantity = (item, delta) => {
    setCartItems(prev => {
      const itemKey = getOptionsKey(item.selectedOptions)
      const updated = prev.map(cartItem => {
        if (cartItem.menuId !== item.menuId) return cartItem
        if (getOptionsKey(cartItem.selectedOptions) !== itemKey) return cartItem
        const newQuantity = cartItem.quantity + delta
        if (newQuantity <= 0) {
          return null
        }
        const optionsPrice = cartItem.selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
        const totalPrice = (cartItem.basePrice + optionsPrice) * newQuantity
        return { ...cartItem, quantity: newQuantity, totalPrice }
      }).filter(Boolean)
      return updated
    })
  }

  const handleOrder = () => {
    if (cartItems.length === 0) return

    const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

    const payload = {
      items: cartItems.map(item => ({
        menuId: item.menuId,
        selectedOptions: item.selectedOptions.map(opt => opt.id),
        quantity: item.quantity
      })),
      totalPrice
    }

    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.orderId) {
          alert(`주문이 완료되었습니다!\n총 금액: ${totalPrice.toLocaleString('ko-KR')}원`)
        } else {
          alert(data.message || '주문 처리 중 오류가 발생했습니다.')
        }
      })
      .catch(() => {
        alert('주문 처리 중 오류가 발생했습니다.')
      })
    
    // 장바구니 비우기
    setCartItems([])
  }

  const handleIncreaseStock = (id) => {
    const target = inventoryItems.find(item => item.id === id)
    if (!target) return
    const newStock = target.stock + 1

    fetch(`${API_BASE}/api/admin/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    })
      .then(res => res.json())
      .then(updated => {
        setInventoryItems(prev =>
          prev.map(item => (item.id === id ? updated : item))
        )
      })
      .catch(() => {
        alert('재고 수정 중 오류가 발생했습니다.')
      })
  }

  const handleDecreaseStock = (id) => {
    const target = inventoryItems.find(item => item.id === id)
    if (!target) return
    const newStock = Math.max(0, target.stock - 1)

    fetch(`${API_BASE}/api/admin/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    })
      .then(res => res.json())
      .then(updated => {
        setInventoryItems(prev =>
          prev.map(item => (item.id === id ? updated : item))
        )
      })
      .catch(() => {
        alert('재고 수정 중 오류가 발생했습니다.')
      })
  }

  const handleStartManufacturing = (orderId, status = '제조 중') => {
    fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(updated => {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: updated.status } : order
          )
        )
      })
      .catch(() => {
        alert('주문 상태 변경 중 오류가 발생했습니다.')
      })
  }

  const dashboardCounts = orders.reduce(
    (acc, order) => {
      acc.total += 1
      if (order.status === '주문 접수') acc.received += 1
      if (order.status === '제조 중') acc.manufacturing += 1
      if (order.status === '제조 완료') acc.completed += 1
      return acc
    },
    { total: 0, received: 0, manufacturing: 0, completed: 0 }
  )

  if (currentPage === 'admin') {
  return (
      <div className="app">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <AdminPage
          dashboardCounts={dashboardCounts}
          inventoryItems={inventoryItems}
          onIncreaseStock={handleIncreaseStock}
          onDecreaseStock={handleDecreaseStock}
          orders={orders}
          onStartManufacturing={handleStartManufacturing}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content">
        <div className="menu-section">
          <h2 className="section-title">메뉴</h2>
          <div className="menu-grid">
            {menus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </main>
      <ShoppingCart
        cartItems={cartItems}
        onOrder={handleOrder}
        onIncrease={(item) => handleChangeQuantity(item, 1)}
        onDecrease={(item) => handleChangeQuantity(item, -1)}
      />
      </div>
  )
}

export default App

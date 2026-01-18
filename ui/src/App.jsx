import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminPage from './components/AdminPage'
import './App.css'

// 임의의 커피 메뉴 데이터
const MENU_DATA = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '카라멜 마키아토',
    price: 5500,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 6,
    name: '바닐라 라떼',
    price: 5500,
    description: '간단한 설명...',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
]

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
  const [cartItems, setCartItems] = useState([])
  const [inventoryItems, setInventoryItems] = useState(INITIAL_INVENTORY)
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [nextOrderId, setNextOrderId] = useState(INITIAL_ORDERS.length + 1)

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleAddToCart = (item) => {
    // 같은 메뉴와 같은 옵션 조합이 있는지 확인
    const existingItemIndex = cartItems.findIndex(
      cartItem =>
        cartItem.menuId === item.menuId &&
        JSON.stringify(cartItem.selectedOptions.map(o => o.id).sort()) ===
        JSON.stringify(item.selectedOptions.map(o => o.id).sort())
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

  const handleOrder = () => {
    if (cartItems.length === 0) return

    const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const menuSummary = cartItems
      .map(item => `${item.menuName} x ${item.quantity}`)
      .join(', ')

    const newOrder = {
      id: nextOrderId,
      orderTime: new Date().toISOString(),
      menuSummary,
      totalPrice,
      status: '주문 접수'
    }

    setOrders(prev => [newOrder, ...prev])
    setNextOrderId(prev => prev + 1)

    alert(`주문이 완료되었습니다!\n총 금액: ${totalPrice.toLocaleString('ko-KR')}원`)
    
    // 장바구니 비우기
    setCartItems([])
  }

  const handleIncreaseStock = (id) => {
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, stock: item.stock + 1 } : item
      )
    )
  }

  const handleDecreaseStock = (id) => {
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock - 1) } : item
      )
    )
  }

  const handleStartManufacturing = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: '제조 중' } : order
      )
    )
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
            {MENU_DATA.map(menu => (
              <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </main>
      <ShoppingCart cartItems={cartItems} onOrder={handleOrder} />
      </div>
  )
}

export default App

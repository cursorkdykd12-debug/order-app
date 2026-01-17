import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
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

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])

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
    const orderData = {
      items: cartItems.map(item => ({
        menuId: item.menuId,
        selectedOptions: item.selectedOptions.map(opt => opt.id),
        quantity: item.quantity
      })),
      totalPrice
    }

    console.log('주문 데이터:', orderData)
    alert(`주문이 완료되었습니다!\n총 금액: ${totalPrice.toLocaleString('ko-KR')}원`)
    
    // 장바구니 비우기
    setCartItems([])
  }

  if (currentPage === 'admin') {
    return (
      <div className="app">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="main-content" style={{ paddingTop: '80px' }}>
          <h1>관리자 화면 (준비 중)</h1>
        </div>
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

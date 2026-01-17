import './ShoppingCart.css'

function ShoppingCart({ cartItems, onOrder }) {
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR')
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const getItemDisplayName = (item) => {
    const optionsText = item.selectedOptions.length > 0
      ? ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
      : ''
    return `${item.menuName}${optionsText} X ${item.quantity}`
  }

  return (
    <div className="shopping-cart">
      <div className="cart-container">
        <h2 className="cart-title">장바구니</h2>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart">장바구니가 비어있습니다.</p>
            ) : (
              <ul className="cart-items-list">
                {cartItems.map((item, index) => (
                  <li key={index} className="cart-item">
                    <span className="item-name">{getItemDisplayName(item)}</span>
                    <span className="item-price">{formatPrice(item.totalPrice)}원</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="cart-summary">
            <div className="total-amount">
              <span className="total-label">총 금액</span>
              <span className="total-value">{formatPrice(calculateTotal())}원</span>
            </div>
            <button
              className="order-button"
              onClick={onOrder}
              disabled={cartItems.length === 0}
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart

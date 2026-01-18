import './AdminPage.css'

function AdminPage({ dashboardCounts, inventoryItems, onIncreaseStock, onDecreaseStock, orders, onStartManufacturing }) {
  const formatPrice = (price) => price.toLocaleString('ko-KR')

  const formatOrderTime = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: '품절', className: 'status-soldout' }
    if (stock < 5) return { label: '주의', className: 'status-warning' }
    return { label: '정상', className: 'status-normal' }
  }

  return (
    <main className="admin-main">
      <section className="admin-section dashboard-section">
        <h2 className="admin-section-title">관리자 대시보드</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="dashboard-label">총 주문</span>
            <span className="dashboard-value">{dashboardCounts.total}</span>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-label">주문 접수</span>
            <span className="dashboard-value">{dashboardCounts.received}</span>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-label">제조 중</span>
            <span className="dashboard-value">{dashboardCounts.manufacturing}</span>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-label">제조 완료</span>
            <span className="dashboard-value">{dashboardCounts.completed}</span>
          </div>
        </div>
      </section>

      <section className="admin-section inventory-section">
        <h2 className="admin-section-title">재고 현황</h2>
        <div className="inventory-grid">
          {inventoryItems.map((item) => {
            const status = getStockStatus(item.stock)
            return (
              <div key={item.id} className="inventory-card">
                <h3 className="inventory-name">{item.name}</h3>
                <div className="inventory-info">
                  <span className="inventory-stock">{item.stock}개</span>
                  <span className={`inventory-status ${status.className}`}>{status.label}</span>
                </div>
                <div className="inventory-controls">
                  <button className="stock-button" onClick={() => onIncreaseStock(item.id)}>+</button>
                  <button className="stock-button" onClick={() => onDecreaseStock(item.id)} disabled={item.stock === 0}>-</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="admin-section orders-section">
        <h2 className="admin-section-title">주문 현황</h2>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="empty-orders">접수된 주문이 없습니다.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-details">
                  <span className="order-time">{formatOrderTime(order.orderTime)}</span>
                  <span className="order-menu">{order.menuSummary}</span>
                  <span className="order-price">{formatPrice(order.totalPrice)}원</span>
                </div>
                <div className="order-actions">
                  {order.status === '주문 접수' && (
                    <button className="order-button" onClick={() => onStartManufacturing(order.id)}>
                      제조 시작
                    </button>
                  )}
                  {order.status === '제조 중' && (
                    <button className="order-button" onClick={() => onStartManufacturing(order.id, '완료')}>
                      제조 완료
                    </button>
                  )}
                  {order.status === '완료' && (
                    <span className="order-status status-completed">완료</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminPage

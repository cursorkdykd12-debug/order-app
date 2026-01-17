import { useState } from 'react'
import './MenuCard.css'

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOptionChange = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId)
      } else {
        return [...prev, optionId]
      }
    })
  }

  const handleAddToCart = () => {
    const selectedOptionsData = menu.options.filter(opt => 
      selectedOptions.includes(opt.id)
    )
    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      basePrice: menu.price,
      selectedOptions: selectedOptionsData,
      quantity: 1
    })
    // 옵션 초기화
    setSelectedOptions([])
  }

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR')
  }

  return (
    <div className="menu-card">
      {menu.image ? (
        <div className="menu-image">
          <img src={menu.image} alt={menu.name} />
        </div>
      ) : (
        <div className="menu-image-placeholder">
          <span>이미지</span>
        </div>
      )}
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{formatPrice(menu.price)}원</p>
        <p className="menu-description">{menu.description}</p>
      </div>
      <div className="menu-options">
        {menu.options.map(option => (
          <label key={option.id} className="option-label">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleOptionChange(option.id)}
            />
            <span>
              {option.name} {option.price > 0 && `(+${formatPrice(option.price)}원)`}
            </span>
          </label>
        ))}
      </div>
      <button className="add-to-cart-button" onClick={handleAddToCart}>
        담기
      </button>
    </div>
  )
}

export default MenuCard

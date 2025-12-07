function formatDate(timestamp) {
  if (!timestamp) {
    return '';
  }
  const d = new Date(timestamp);
  return d.toLocaleString();
}

function OrderDetail({ order, menuById }) {
  const safeTotal =
    typeof order.totalPrice === 'number'
      ? order.totalPrice.toFixed(2)
      : '0.00';

  return (
    <div className="order-detail">
      <div className="order-detail__header">
        <span className="order-detail__id">Order #{order.id}</span>
        <span className="order-detail__time">
          {formatDate(order.createdAt)}
        </span>
      </div>

      <div className="order-detail__meta">
        <span className={`order-detail__status order-detail__status--${order.status}`}>
          Status: {order.status}
        </span>
        <span className="order-detail__total">
          Total: ${safeTotal}
        </span>
      </div>

      <ul className="order-detail__items">
        {order.items.map((item) => {
          const menuItem = menuById[item.menuItemId];
          const name = menuItem ? menuItem.name : `Item ${item.menuItemId}`;
          const price = menuItem && typeof menuItem.price === 'number'
            ? menuItem.price
            : null;

          return (
            <li
              key={item.menuItemId}
              className="order-detail__item"
            >
              <span className="order-detail__item-name">{name}</span>
              <span className="order-detail__item-qty">
                × {item.quantity}
              </span>
              {price !== null && (
                <span className="order-detail__item-subtotal">
                  ${(price * item.quantity).toFixed(2)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default OrderDetail;
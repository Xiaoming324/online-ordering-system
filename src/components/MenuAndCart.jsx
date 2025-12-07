import { useEffect, useState } from 'react';
import { fetchJSON } from '../services/api';
import './MenuAndCart.css';

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'main', label: 'Main Dish' },
  { value: 'side', label: 'Side Dish' },
  { value: 'drink', label: 'Drink' },
  { value: 'dessert', label: 'Dessert' },
];

function MenuAndCart({
  user,
  cartItems,
  onCartItemsChange,
  onShowMessage,
  onSessionExpired,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [menuError, setMenuError] = useState('');
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartNotice, setCartNotice] = useState('');

  useEffect(() => {
    if (!cartNotice) {
      return;
    }
    const id = setTimeout(() => {
      setCartNotice('');
    }, 2000);
    return () => clearTimeout(id);
  }, [cartNotice]);

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchJSON('/api/cart')
      .then((data) => {
        const items = data.items || [];
        onCartItemsChange(items);
      })
      .catch((err) => {
        if (err && err.error === 'auth-missing') {
          onSessionExpired && onSessionExpired();
        }
      });
  }, [user && user.username]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchJSON('/api/cart')
        .then((data) => {
          const items = data.items || [];
          onCartItemsChange(items);
        })
        .catch((err) => {
          if (err && err.error === 'auth-missing') {
            onSessionExpired && onSessionExpired();
          }
        });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user && user.username]);

  useEffect(() => {
    setMenuError('');
    setIsLoadingMenu(true);

    fetchJSON('/api/menu-items')
      .then((data) => {
        setMenuItems(data.items || []);
        setIsLoadingMenu(false);
      })
      .catch((err) => {
        setIsLoadingMenu(false);
        if (err && err.error === 'auth-missing') {
          onSessionExpired && onSessionExpired();
          return;
        }
        setMenuError('Failed to load menu items.');
      });
  }, [user && user.username]);

  function saveCart(nextCart) {
    const payloadItems = nextCart.map((ci) => ({
      menuItemId: ci.menuItemId,
      quantity: ci.quantity,
    }));

    return fetchJSON('/api/cart', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: payloadItems }),
    }).catch((err) => {
      if (err && err.error === 'auth-missing') {
        onSessionExpired && onSessionExpired();
        return;
      }

      onShowMessage &&
        onShowMessage(
          'error',
          'Failed to save cart. Your latest changes may not persist.',
        );
    });
  }

  function addToCart(item) {
    const existing = cartItems.find((ci) => ci.menuItemId === item.id);
    let next;
    if (existing) {
      next = cartItems.map((ci) =>
        ci.menuItemId === item.id
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci,
      );
    } else {
      next = cartItems.concat({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }
    onCartItemsChange(next);
    saveCart(next);

    setCartNotice(`Added ${item.name} to cart.`);
  }

  function changeQuantity(menuItemId, delta) {
    const next = cartItems
      .map((ci) =>
        ci.menuItemId === menuItemId
          ? { ...ci, quantity: ci.quantity + delta }
          : ci,
      )
      .filter((ci) => ci.quantity > 0);

    onCartItemsChange(next);
    saveCart(next);
  }

  function handlePlaceOrder() {
    if (cartItems.length === 0 || isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);

    const itemsPayload = cartItems.map((ci) => ({
      menuItemId: ci.menuItemId,
      quantity: ci.quantity,
    }));

    fetchJSON('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: itemsPayload }),
    })
      .then(() => {
        const empty = [];
        onCartItemsChange(empty);
        return saveCart(empty);
      })
      .then(() => {
        setIsPlacingOrder(false);
        setCartNotice('Order placed successfully.');
      })
      .catch((err) => {
        setIsPlacingOrder(false);

        if (err && err.error === 'auth-missing') {
          onSessionExpired && onSessionExpired();
          return;
        }

        if (err && err.error === 'invalid-order-items') {
          onShowMessage &&
            onShowMessage('error', 'Invalid order items.');
        } else {
          onShowMessage &&
            onShowMessage('error', 'Failed to place order.');
        }
      });
  }

  function handleSelectCategory(value) {
    setSelectedCategory(value);
  }

  const filteredMenuItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const totalPrice = cartItems.reduce(
    (sum, ci) => sum + (ci.price || 0) * ci.quantity,
    0,
  );

  return (
    <section className="menu-cart">
      <aside className="menu-cart__categories">
        <h3 className="menu-cart__categories-title">Categories</h3>
        <ul className="menu-cart__categories-list">
          {CATEGORY_TABS.map((cat) => (
            <li key={cat.value}>
              <button
                type="button"
                className={
                  cat.value === selectedCategory
                    ? 'menu-cart__category-button menu-cart__category-button--active'
                    : 'menu-cart__category-button'
                }
                onClick={() => handleSelectCategory(cat.value)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="menu-cart__content">
        <div className="menu">
          <div className="menu__header">
            <h2 className="menu__title">Menu</h2>
            {isLoadingMenu && (
              <span className="menu__loading">Loading...</span>
            )}
          </div>

          {menuError && <p className="menu__error">{menuError}</p>}

          {filteredMenuItems.length === 0 &&
            !menuError &&
            !isLoadingMenu && (
              <p className="menu__empty">
                No menu items in this category yet.
              </p>
            )}

          <ul className="menu__list">
            {filteredMenuItems.map((item) => (
              <li key={item.id} className="menu__item">
                {item.imageUrl ? (
                  <img
                    className="menu__image"
                    src={item.imageUrl}
                    alt={item.name}
                  />
                ) : null}
                <div className="menu__info">
                  <h3 className="menu__item-name">{item.name}</h3>
                  <p className="menu__item-desc">
                    {item.description}
                  </p>
                  <p className="menu__item-meta">
                    <span className="menu__item-price">
                      {typeof item.price === 'number'
                        ? `$${item.price.toFixed(2)}`
                        : 'N/A'}
                    </span>
                    <span className="menu__item-category">
                      {item.category}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="menu__add-button"
                    onClick={() => addToCart(item)}
                  >
                    Add to cart
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="cart">
          <h2 className="cart__title">Cart</h2>

          {cartNotice && (
            <p className="cart__notice">{cartNotice}</p>
          )}

          {cartItems.length === 0 && (
            <p className="cart__empty">Your cart is empty.</p>
          )}

          <ul className="cart__list">
            {cartItems.map((ci) => (
              <li key={ci.menuItemId} className="cart__item">
                <div className="cart__item-main">
                  <span className="cart__item-name">
                    {ci.name}
                  </span>
                  <span className="cart__item-price">
                    {typeof ci.price === 'number'
                      ? `$${ci.price.toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="cart__item-controls">
                  <button
                    type="button"
                    className="cart__button"
                    onClick={() =>
                      changeQuantity(ci.menuItemId, -1)
                    }
                  >
                    −
                  </button>
                  <span className="cart__item-qty">
                    {ci.quantity}
                  </span>
                  <button
                    type="button"
                    className="cart__button"
                    onClick={() =>
                      changeQuantity(ci.menuItemId, 1)
                    }
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart__footer">
            <span className="cart__total-label">Total:</span>
            <span className="cart__total-value">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            className="cart__place-order"
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0 || isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </aside>
      </div>
    </section>
  );
}

export default MenuAndCart;
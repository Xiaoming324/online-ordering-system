import { useEffect, useState } from 'react';
import { fetchJSON } from '../services/api';
import './OrderPage.css';

function OrderPage({ user, onShowMessage, onSessionExpired }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  function loadOrders(silent = false) {
    if (!user) {
      return;
    }

    if (!silent) {
      setIsLoading(true);
      setLoadError('');
    }

    Promise.all([fetchJSON('/api/orders'), fetchJSON('/api/menu-items')])
      .then(([ordersData, menuData]) => {
        const rawOrders = ordersData.orders || [];
        const menuList = menuData.items || [];

        const menuById = {};
        menuList.forEach((m) => {
          menuById[m.id] = m;
        });

        const enrichedOrders = rawOrders.map((order) => {
          const items = (order.items || []).map((it) => {
            const m = menuById[it.menuItemId] || {};
            return {
              ...it,
              name: m.name || `Item ${it.menuItemId}`,
              price: m.price,
            };
          });
          return {
            ...order,
            items,
          };
        });

        enrichedOrders.sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        );

        setOrders(enrichedOrders);

        if (!silent) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        const code = (err && err.error) || '';

        if (code === 'auth-missing' && onSessionExpired) {
          if (!silent) {
            setIsLoading(false);
          }
          onSessionExpired();
          return;
        }

        if (!silent) {
          setLoadError('Failed to load your orders.');
          setIsLoading(false);
        }
      });
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    loadOrders(false);
  }, [user && user.username]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = setInterval(() => {
      loadOrders(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user && user.username]);

  function formatDate(value) {
    if (!value) {
      return '';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleString();
  }

  function handleOpenCancelModal(order, canCancel) {
    if (!canCancel || !order) {
      return;
    }
    setConfirmOrder(order);
    setCancelError('');
  }

  function handleCloseModal() {
    if (isCancelling) return;
    setConfirmOrder(null);
    setCancelError('');
  }

  function handleConfirmCancel() {
    if (!confirmOrder || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setCancelError('');

    fetchJSON(`/api/orders/${confirmOrder.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'canceled' }),
    })
      .then(() => {
        setOrders((current) =>
          current.map((o) =>
            o.id === confirmOrder.id ? { ...o, status: 'canceled' } : o,
          ),
        );
        setIsCancelling(false);
        setConfirmOrder(null);
      })
      .catch((err) => {
        const code = (err && err.error) || '';
        let message =
          'Failed to cancel the order. Please try again.';

        if (code === 'cannot-cancel') {
          message = 'This order can no longer be canceled.';
        } else if (code === 'auth-missing' && onSessionExpired) {
          setIsCancelling(false);
          setConfirmOrder(null);
          setCancelError('');
          onSessionExpired();
          return;
        }

        setIsCancelling(false);
        setCancelError(message);
        onShowMessage && onShowMessage('error', message);
      });
  }

  const confirmDisplayNumber =
    confirmOrder && orders.length
      ? orders.length -
      orders.findIndex((o) => o.id === confirmOrder.id)
      : null;

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <h2 className="orders-page__title">My Orders</h2>
        {isLoading && (
          <span className="orders-page__loading">Loading...</span>
        )}
      </header>

      {loadError && <p className="orders-page__error">{loadError}</p>}

      {!isLoading && !loadError && orders.length === 0 && (
        <p className="orders-page__empty">
          You have not placed any orders yet.
        </p>
      )}

      <div className="orders-page__list">
        {orders.map((order, index) => {
          const isPending = order.status === 'pending';

          const itemCount = (order.items || []).reduce(
            (sum, it) => sum + (it.quantity || 0),
            0,
          );

          const displayNumber = orders.length - index;

          return (
            <article key={order.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__header-main">
                  <span className="order-card__id">
                    Order #{displayNumber}
                  </span>
                  <span className="order-card__date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="order-card__header-right">
                  <span
                    className={
                      'order-card__status order-card__status--' +
                      order.status
                    }
                  >
                    {order.status}
                  </span>
                  <button
                    type="button"
                    className="order-card__cancel"
                    disabled={!isPending || isCancelling}
                    onClick={() =>
                      handleOpenCancelModal(order, isPending)
                    }
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              <ul className="order-card__items">
                {(order.items || []).map((it) => (
                  <li
                    key={it.menuItemId}
                    className="order-card__item"
                  >
                    <span className="order-card__item-name">
                      {it.name}
                    </span>
                    <span className="order-card__item-qty">
                      ×{it.quantity}
                    </span>
                    {typeof it.price === 'number' && (
                      <span className="order-card__item-price">
                        ${(it.price * it.quantity).toFixed(2)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="order-card__footer">
                <span className="order-card__summary">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                <div className="order-card__total">
                  <span className="order-card__total-label">
                    Total:
                  </span>
                  <span className="order-card__total-value">
                    {typeof order.totalPrice === 'number'
                      ? `$${order.totalPrice.toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {confirmOrder && (
        <div className="orders-page__modal-backdrop">
          <div className="orders-page__modal">
            <button
              type="button"
              className="orders-page__modal-close"
              onClick={handleCloseModal}
              disabled={isCancelling}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="orders-page__modal-title">
              Cancel this order?
            </h3>
            <p className="orders-page__modal-text">
              You are about to cancel{' '}
              <strong>
                Order #
                {confirmDisplayNumber ?? confirmOrder.id}
              </strong>{' '}
              placed at {formatDate(confirmOrder.createdAt)}. This
              action cannot be undone.
            </p>

            {cancelError && (
              <p className="orders-page__modal-error">
                {cancelError}
              </p>
            )}

            <div className="orders-page__modal-actions">
              <button
                type="button"
                className="orders-page__modal-button orders-page__modal-button--danger"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling…' : 'Yes, cancel order'}
              </button>
              <button
                type="button"
                className="orders-page__modal-button orders-page__modal-button--secondary"
                onClick={handleCloseModal}
                disabled={isCancelling}
              >
                Keep order
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderPage;
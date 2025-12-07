import { useEffect, useMemo, useState } from 'react';
import { fetchJSON } from '../services/api';
import './AdminOrderPage.css';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

const STATUS_TRANSITIONS = {
  pending: ['preparing', 'ready', 'completed', 'canceled'],
  preparing: ['ready', 'completed', 'canceled'],
  ready: ['completed', 'canceled'],
  completed: [],
  canceled: [],
};

const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  canceled: 'Canceled',
};

function AdminOrderPage({ user, onShowMessage, onSessionExpired }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [menuItemsMap, setMenuItemsMap] = useState({});

  function handleAuthMissing(err) {
    if (err && err.error === 'auth-missing') {
      if (onSessionExpired) {
        onSessionExpired();
      }
      return true;
    }
    return false;
  }

  function loadOrders(silent = false) {
    if (!silent) {
      setIsLoading(true);
      setLoadError('');
    }

    fetchJSON('/api/admin/orders')
      .then((data) => {
        const list = data.orders || [];

        const sorted = list.slice().sort((a, b) => {
          const ta = a.createdAt || 0;
          const tb = b.createdAt || 0;
          return tb - ta;
        });

        setOrders(sorted);

        if (!silent) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (handleAuthMissing(err)) {
          return;
        }
        if (!silent) {
          setIsLoading(false);
          setLoadError('Failed to load orders.');
        }
      });
  }

  function loadMenuItems() {
    fetchJSON('/api/menu-items')
      .then((data) => {
        const items = data.items || [];
        const map = {};
        items.forEach((item) => {
          map[item.id] = item;
        });
        setMenuItemsMap(map);
      })
      .catch((err) => {
        if (handleAuthMissing(err)) {
          return;
        }
      });
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    loadOrders(false);
    loadMenuItems();
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

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  function formatDate(timestamp) {
    if (!timestamp) {
      return '';
    }
    const d = new Date(timestamp);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getMenuItemInfo(orderItem) {
    const meta = menuItemsMap[orderItem.menuItemId];
    const name = meta ? meta.name : `Item #${orderItem.menuItemId}`;
    const unitPrice =
      meta && typeof meta.price === 'number' ? meta.price : null;
    return { name, unitPrice };
  }

  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
  }

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isUpdating: true } : order,
      ),
    );

    fetchJSON(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((data) => {
        const updated = data.order;
        setOrders((prev) =>
          prev.map((order) =>
            order.id === updated.id
              ? { ...updated, isUpdating: false }
              : order,
          ),
        );
      })
      .catch((err) => {
        if (handleAuthMissing(err)) {
          return;
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, isUpdating: false }
              : order,
          ),
        );

        if (onShowMessage) {
          onShowMessage('error', 'Failed to update order status.');
        }
      });
  }

  function renderStatusBadge(status) {
    const baseClass = 'admin-orders__status-badge';
    const extraClass = `${baseClass}--${status}`;
    return (
      <span className={`${baseClass} ${extraClass}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  }

  function renderStatusSelect(order) {
    const current = order.status;
    const allowed = STATUS_TRANSITIONS[current] || [];

    return (
      <select
        className="admin-orders__status-select"
        value={current}
        onChange={(e) => handleStatusChange(order.id, e.target.value)}
        disabled={order.isUpdating || allowed.length === 0}
      >
        <option value={current}>
          {STATUS_LABELS[current] || current}
        </option>
        {allowed.map((st) => (
          <option key={st} value={st}>
            {STATUS_LABELS[st]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <section className="admin-orders">
      <header className="admin-orders__header">
        <div>
          <h2 className="admin-orders__title">Admin Order Management</h2>
          <p className="admin-orders__subtitle">
            View and update customer orders.
          </p>
        </div>

        <div className="admin-orders__controls">
          <label className="admin-orders__filter-label">
            <span>Status:</span>
            <select
              className="admin-orders__filter-select"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {loadError && (
        <p className="admin-orders__error">{loadError}</p>
      )}

      {isLoading && (
        <p className="admin-orders__loading">Loading orders...</p>
      )}

      {!isLoading && filteredOrders.length === 0 && !loadError && (
        <p className="admin-orders__empty">No orders found.</p>
      )}

      <div className="admin-orders__list">
        {filteredOrders.map((order) => (
          <article key={order.id} className="admin-orders__card">
            <header className="admin-orders__card-header">
              <div className="admin-orders__card-main">
                <div className="admin-orders__card-title-row">
                  <h3 className="admin-orders__card-title">
                    Order #{order.id}
                  </h3>
                  {renderStatusBadge(order.status)}
                </div>
                <p className="admin-orders__card-subtitle">
                  <span>
                    Customer:{' '}
                    <strong>{order.owner || 'Unknown'}</strong>
                  </span>
                  <span className="admin-orders__dot">•</span>
                  <span>
                    Placed at{' '}
                    <strong>{formatDate(order.createdAt)}</strong>
                  </span>
                </p>
              </div>

              <div className="admin-orders__card-status-control">
                <span className="admin-orders__status-label">
                  Change status:
                </span>
                {renderStatusSelect(order)}
                {order.status === 'canceled' && (
                  <div className="admin-orders__status-hint">
                    Canceled orders cannot be changed.
                  </div>
                )}
              </div>
            </header>

            <div className="admin-orders__card-body">
              <section className="admin-orders__items">
                <h4 className="admin-orders__section-title">
                  Items
                </h4>
                <ul className="admin-orders__item-list">
                  {order.items.map((item, index) => {
                    const { name, unitPrice } =
                      getMenuItemInfo(item);
                    const lineTotal =
                      unitPrice != null
                        ? unitPrice * item.quantity
                        : null;

                    return (
                      <li
                        key={`${item.menuItemId}-${index}`}
                        className="admin-orders__item"
                      >
                        <span className="admin-orders__item-name">
                          {name}
                        </span>
                        <span className="admin-orders__item-qty">
                          ×{item.quantity}
                        </span>
                        {lineTotal != null && (
                          <span className="admin-orders__item-line-total">
                            ${lineTotal.toFixed(2)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="admin-orders__summary">
                <h4 className="admin-orders__section-title">
                  Summary
                </h4>
                <div className="admin-orders__summary-row">
                  <span>Total:</span>
                  <span className="admin-orders__summary-total">
                    $
                    {typeof order.totalPrice === 'number'
                      ? order.totalPrice.toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </section>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminOrderPage;
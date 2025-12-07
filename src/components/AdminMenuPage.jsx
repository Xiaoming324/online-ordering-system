import { useEffect, useState } from 'react';
import { fetchJSON } from '../services/api';
import AdminMenuForm from './AdminMenuForm.jsx';

import './MenuAndCart.css';
import './AdminMenuPage.css';

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'main', label: 'Main Dish' },
  { value: 'side', label: 'Side Dish' },
  { value: 'drink', label: 'Drink' },
  { value: 'dessert', label: 'Dessert' },
];

function AdminMenuPage({ user, onShowMessage, onSessionExpired }) {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const [actionError, setActionError] = useState('');

  function handleMaybeAuthError(err) {
    const code = err && err.error;
    if (
      code === 'auth-missing' ||
      code === 'auth-forbidden' ||
      code === 'not-admin'
    ) {
      if (onSessionExpired) {
        onSessionExpired();
      }
      return true;
    }
    return false;
  }

  function loadMenu() {
    setIsLoading(true);
    setLoadError('');
    fetchJSON('/api/menu-items')
      .then((data) => {
        setMenuItems(data.items || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (handleMaybeAuthError(err)) {
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        setLoadError('Failed to load menu items.');
      });
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchJSON('/api/session')
      .then((data) => {
        if (!data.loggedIn || data.role !== 'admin') {
          if (onSessionExpired) {
            onSessionExpired();
          }
          return;
        }
        loadMenu();
      })
      .catch(() => {
        if (onSessionExpired) {
          onSessionExpired();
        }
      });
  }, [user && user.username]);

  function handleSelectCategory(value) {
    setSelectedCategory(value);
  }

  function openCreateModal() {
    setFormMode('create');
    setEditingItem(null);
    setActionError('');
    setIsFormModalOpen(true);
  }

  function openEditModal(item) {
    setFormMode('edit');
    setEditingItem(item);
    setActionError('');
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    if (isSubmitting) {
      return;
    }
    setIsFormModalOpen(false);
    setEditingItem(null);
    setFormMode('create');
    setActionError('');
  }

  function handleFormSubmit(formData) {
    setIsSubmitting(true);
    setActionError('');

    if (formMode === 'create') {
      fetchJSON('/api/menu-items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then((data) => {
          const newItem = data.item;
          setMenuItems((prev) => prev.concat(newItem));
          setIsSubmitting(false);
          closeFormModal();
        })
        .catch((err) => {
          if (handleMaybeAuthError(err)) {
            setIsSubmitting(false);
            return;
          }

          setIsSubmitting(false);
          let msg = 'Failed to create menu item.';
          if (err.error === 'invalid-menu-item') {
            msg = 'Invalid menu item data. Please check fields.';
          }
          setActionError(msg);
          if (onShowMessage) {
            onShowMessage('error', msg);
          }
        });
    } else if (formMode === 'edit' && editingItem) {
      fetchJSON(`/api/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then((data) => {
          const updated = data.item;
          setMenuItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
          setIsSubmitting(false);
          closeFormModal();
        })
        .catch((err) => {
          if (handleMaybeAuthError(err)) {
            setIsSubmitting(false);
            return;
          }

          setIsSubmitting(false);
          let msg = 'Failed to update menu item.';
          if (err.error === 'invalid-name') {
            msg = 'Invalid name.';
          } else if (err.error === 'invalid-price') {
            msg = 'Invalid price.';
          } else if (err.error === 'invalid-category') {
            msg = 'Invalid category.';
          } else if (err.error === 'menu-item-not-found') {
            msg = 'Menu item not found.';
          }
          setActionError(msg);
          if (onShowMessage) {
            onShowMessage('error', msg);
          }
        });
    }
  }

  function openDeleteModal(item) {
    setDeleteTarget(item);
    setActionError('');
  }

  function closeDeleteModal() {
    if (isDeleteSubmitting) {
      return;
    }
    setDeleteTarget(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }
    setIsDeleteSubmitting(true);
    setActionError('');

    fetchJSON(`/api/menu-items/${deleteTarget.id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setMenuItems((prev) =>
          prev.filter((item) => item.id !== deleteTarget.id),
        );
        setIsDeleteSubmitting(false);
        closeDeleteModal();
      })
      .catch((err) => {
        if (handleMaybeAuthError(err)) {
          setIsDeleteSubmitting(false);
          return;
        }

        setIsDeleteSubmitting(false);
        let msg = 'Failed to delete menu item.';
        if (err.error === 'menu-item-not-found') {
          msg = 'Menu item not found.';
        }
        setActionError(msg);
        if (onShowMessage) {
          onShowMessage('error', msg);
        }
      });
  }

  const filteredMenuItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <section className="admin-menu">
      <header className="admin-menu__header">
        <div>
          <h2 className="admin-menu__title">Admin Menu Management</h2>
        </div>
        <button
          type="button"
          className="admin-menu__button admin-menu__button--primary"
          onClick={openCreateModal}
        >
          Add New Dish
        </button>
      </header>

      {isLoading && <p className="admin-menu__hint">Loading menu...</p>}
      {loadError && <p className="admin-menu__error">{loadError}</p>}
      {actionError && <p className="admin-menu__error">{actionError}</p>}

      <div className="admin-menu__content">
        <aside className="admin-menu__categories">
          <h3 className="admin-menu__categories-title">Categories</h3>
          <ul className="admin-menu__categories-list">
            {CATEGORY_TABS.map((cat) => (
              <li key={cat.value}>
                <button
                  type="button"
                  className={
                    cat.value === selectedCategory
                      ? 'admin-menu__category-button admin-menu__category-button--active'
                      : 'admin-menu__category-button'
                  }
                  onClick={() => handleSelectCategory(cat.value)}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="admin-menu__list-wrapper">
          <h3 className="admin-menu__section-title">Current Menu</h3>
          {filteredMenuItems.length === 0 && !isLoading && !loadError && (
            <p className="admin-menu__empty">
              No menu items in this category yet.
            </p>
          )}

          <ul className="menu__list">
            {filteredMenuItems.map((item) => (
              <li key={item.id} className="menu__item admin-menu__item">
                {item.imageUrl ? (
                  <img
                    className="menu__image"
                    src={item.imageUrl}
                    alt={item.name}
                  />
                ) : null}
                <div className="menu__info">
                  <h4 className="menu__item-name">{item.name}</h4>
                  <p className="menu__item-desc">{item.description}</p>
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
                  <div className="admin-menu__item-actions">
                    <button
                      type="button"
                      className="admin-menu__small-button"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-menu__small-button admin-menu__small-button--danger"
                      onClick={() => openDeleteModal(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isFormModalOpen && (
        <div className="admin-modal" onClick={closeFormModal}>
          <div
            className="admin-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="admin-modal__header">
              <h3 className="admin-modal__title">
                {formMode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={closeFormModal}
              >
                ×
              </button>
            </header>

            <div className="admin-modal__body">
              <AdminMenuForm
                initialItem={formMode === 'edit' ? editingItem : null}
                onSubmit={handleFormSubmit}
                onCancel={closeFormModal}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal" onClick={closeDeleteModal}>
          <div
            className="admin-modal__dialog admin-modal__dialog--small"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="admin-modal__header">
              <h3 className="admin-modal__title">Delete Dish</h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={closeDeleteModal}
              >
                ×
              </button>
            </header>

            <div className="admin-modal__body">
              <p className="admin-modal__text">
                Are you sure you want to delete{' '}
                <strong>{deleteTarget.name}</strong>?
              </p>
            </div>

            <footer className="admin-modal__footer">
              <button
                type="button"
                className="admin-menu__small-button admin-menu__small-button--danger"
                onClick={handleConfirmDelete}
                disabled={isDeleteSubmitting}
              >
                {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="admin-menu__small-button"
                onClick={closeDeleteModal}
                disabled={isDeleteSubmitting}
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminMenuPage;
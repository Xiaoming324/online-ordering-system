import { useEffect, useState } from 'react';
import './AdminMenuForm.css';

const CATEGORY_OPTIONS = [
  { value: 'main', label: 'Main Dish' },
  { value: 'side', label: 'Side Dish' },
  { value: 'drink', label: 'Drink' },
  { value: 'dessert', label: 'Dessert' },
];

function AdminMenuForm({ initialItem, onSubmit, onCancel, isSubmitting }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('main');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setPrice(
        typeof initialItem.price === 'number'
          ? String(initialItem.price)
          : initialItem.price || ''
      );
      setDescription(initialItem.description || '');
      setCategory(initialItem.category || 'main');
      setImageUrl(initialItem.imageUrl || '');
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategory('main');
      setImageUrl('');
    }
  }, [initialItem]);

  function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const trimmedImage = imageUrl.trim();
    const numericPrice = Number(price);

    onSubmit({
      name: trimmedName,
      price: numericPrice,
      description: trimmedDesc,
      category,
      imageUrl: trimmedImage,
    });
  }

  const isEditMode = !!initialItem;

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__row">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="admin-name">
            Name
          </label>
          <input
            id="admin-name"
            className="admin-form__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="admin-form__field admin-form__field--sm">
          <label className="admin-form__label" htmlFor="admin-price">
            Price
          </label>
          <input
            id="admin-price"
            className="admin-form__input"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="admin-form__row admin-form__row--stacked">
        <div className="admin-form__field">
          <label
            className="admin-form__label"
            htmlFor="admin-description"
          >
            Description
          </label>
          <textarea
            id="admin-description"
            className="admin-form__textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            required
          />
        </div>
      </div>

      <div className="admin-form__row">
        <div className="admin-form__field admin-form__field--sm">
          <label className="admin-form__label" htmlFor="admin-category">
            Category
          </label>
          <select
            id="admin-category"
            className="admin-form__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="admin-image">
            Image URL (optional)
          </label>
          <input
            id="admin-image"
            className="admin-form__input"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            maxLength={300}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="admin-form__actions">
        <button
          type="submit"
          className="admin-form__button admin-form__button--primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
              ? 'Save Changes'
              : 'Save'}
        </button>
        <button
          type="button"
          className="admin-form__button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AdminMenuForm;
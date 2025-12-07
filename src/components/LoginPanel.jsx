import { useState } from 'react';
import { fetchJSON } from '../services/api';
import './LoginPanel.css';

function LoginPanel({ onLoginSuccess, onShowMessage }) {
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  function openRegisterModal() {
    setRegisterError('');
    setInfoMessage('');
    setShowRegisterModal(true);
  }

  function closeRegisterModal() {
    setShowRegisterModal(false);
  }

  function handleLogin(evt) {
    evt.preventDefault();
    setLoginError('');
    setInfoMessage('');

    const trimmed = loginName.trim();
    if (!trimmed) {
      setLoginError('Username is required for login.');
      return;
    }

    setIsSubmittingLogin(true);

    fetchJSON('/api/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: trimmed }),
    })
      .then((data) => {
        setIsSubmittingLogin(false);
        setLoginError('');
        setInfoMessage('');
        onLoginSuccess({ username: data.username, role: data.role });
      })
      .catch((err) => {
        setIsSubmittingLogin(false);

        if (err.error === 'invalid-username') {
          setLoginError('Invalid username. Use 2-20 letters, numbers, or underscore.');
        } else if (err.error === 'auth-forbidden') {
          setLoginError('This user is not allowed to log in.');
        } else if (err.error === 'user-not-found') {
          setLoginError('User not found. Please register first.');
        } else if (err.error === 'network-error') {
          setLoginError('Network error. Please check connection.');
        } else {
          setLoginError('Failed to log in. Please try again.');
        }
      });
  }

  function handleRegister(evt) {
    evt.preventDefault();
    setRegisterError('');
    setInfoMessage('');

    const trimmed = registerName.trim();
    if (!trimmed) {
      setRegisterError('Username is required for registration.');
      return;
    }

    setIsSubmittingRegister(true);

    fetchJSON('/api/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: trimmed }),
    })
      .then((data) => {
        setIsSubmittingRegister(false);
        setRegisterError('');
        setLoginError('');
        setInfoMessage('Registered successfully, please log in.');

        setLoginName(data.username);

        setShowRegisterModal(false);
      })
      .catch((err) => {
        setIsSubmittingRegister(false);

        if (err.error === 'invalid-username') {
          setRegisterError('Invalid username. Use 2-20 letters, numbers, or underscore.');
        } else if (err.error === 'forbidden-username') {
          setRegisterError('This username is not allowed.');
        } else if (err.error === 'user-exists') {
          setRegisterError('User already exists. Please log in.');
        } else if (err.error === 'network-error') {
          setRegisterError('Network error. Please check connection.');
        } else {
          setRegisterError('Failed to register. Please try again.');
        }
      });
  }

  return (
    <section className="auth">
      <h2 className="auth__title">Log In</h2>

      {loginError && <p className="auth__error">{loginError}</p>}
      {infoMessage && <p className="auth__info">{infoMessage}</p>}

      <form className="auth__form auth__form--login" onSubmit={handleLogin}>
        <label className="auth__label">
          Username
          <input
            className="auth__input"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            disabled={isSubmittingLogin}
          />
        </label>
        <button
          className="auth__button auth__button--primary"
          type="submit"
          disabled={isSubmittingLogin}
        >
          {isSubmittingLogin ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth__hint">
          You can log in directly as <strong>admin</strong> (predefined administrator).
        </p>
        <p className="auth__register-hint">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="auth__link-button"
            onClick={openRegisterModal}
          >
            Register
          </button>
        </p>
      </form>

      {showRegisterModal && (
        <div className="modal">
          <div className="modal__backdrop" />

          <div
            className="modal__content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
          >
            <div className="modal__header">
              <h3 id="register-modal-title" className="modal__title">
                Register
              </h3>
              <button
                type="button"
                className="modal__close-button"
                onClick={closeRegisterModal}
                disabled={isSubmittingRegister}
              >
                ×
              </button>
            </div>

            {registerError && (
              <p className="modal__error">{registerError}</p>
            )}

            <form
              className="modal__form"
              onSubmit={handleRegister}
            >
              <label className="modal__label">
                Username
                <input
                  className="modal__input"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  disabled={isSubmittingRegister}
                />
              </label>

              <p className="modal__hint">
                Use 2–20 characters: letters, numbers, or underscore. Username
                <strong> dog </strong> is not allowed.
              </p>

              <div className="modal__buttons">
                <button
                  type="submit"
                  className="modal__button modal__button--primary"
                  disabled={isSubmittingRegister}
                >
                  {isSubmittingRegister ? 'Registering...' : 'Register'}
                </button>
                <button
                  type="button"
                  className="modal__button"
                  onClick={closeRegisterModal}
                  disabled={isSubmittingRegister}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default LoginPanel;
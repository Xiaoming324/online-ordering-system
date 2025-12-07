import './Header.css';

function Header({ user, currentView, onChangeView, onLogout }) {
  const headerClassName = user
    ? 'app-header'
    : 'app-header app-header--center';

  function handleChangeView(view) {
    if (!onChangeView) {
      return;
    }
    onChangeView(view);
  }

  return (
    <header className={headerClassName}>
      <div className="app-header__inner">
        {user ? (
          <>
            <div className="app-header__left">
              <h1 className="app-header__title">Online Ordering System</h1>

              <nav className="app-header__nav">
                {user.role === 'admin' ? (
                  <>
                    <button
                      type="button"
                      className={
                        currentView === 'admin-menu'
                          ? 'app-header__nav-button app-header__nav-button--active'
                          : 'app-header__nav-button'
                      }
                      onClick={() => handleChangeView('admin-menu')}
                    >
                      Menu
                    </button>
                    <button
                      type="button"
                      className={
                        currentView === 'admin-orders'
                          ? 'app-header__nav-button app-header__nav-button--active'
                          : 'app-header__nav-button'
                      }
                      onClick={() => handleChangeView('admin-orders')}
                    >
                      Customer Orders
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={
                        currentView === 'menu'
                          ? 'app-header__nav-button app-header__nav-button--active'
                          : 'app-header__nav-button'
                      }
                      onClick={() => handleChangeView('menu')}
                    >
                      Menu
                    </button>
                    <button
                      type="button"
                      className={
                        currentView === 'orders'
                          ? 'app-header__nav-button app-header__nav-button--active'
                          : 'app-header__nav-button'
                      }
                      onClick={() => handleChangeView('orders')}
                    >
                      My Orders
                    </button>
                  </>
                )}
              </nav>
            </div>

            <div className="app-header__user">
              <span className="app-header__username">
                {user.username} ({user.role})
              </span>
              <button
                type="button"
                className="app-header__logout-button"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <h1 className="app-header__title">Online Ordering System</h1>
        )}
      </div>
    </header>
  );
}

export default Header;
import { useEffect, useState } from 'react';
import { fetchJSON } from './services/api';

import Header from './components/Header.jsx';
import MessageBar from './components/MessageBar.jsx';
import LoginPanel from './components/LoginPanel.jsx';
import MenuAndCart from './components/MenuAndCart.jsx';
import OrderPage from './components/OrderPage.jsx';
import AdminMenuPage from './components/AdminMenuPage.jsx';
import AdminOrderPage from './components/AdminOrderPage.jsx';

const VIEW_MENU = 'menu';
const VIEW_ORDERS = 'orders';
const VIEW_ADMIN_MENU = 'admin-menu';
const VIEW_ADMIN_ORDERS = 'admin-orders';

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentView, setCurrentView] = useState(VIEW_MENU);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchJSON('/api/session')
      .then((data) => {
        if (data.loggedIn) {
          const nextUser = {
            username: data.username,
            role: data.role,
          };
          setUser(nextUser);

          if (data.role === 'admin') {
            setCurrentView(VIEW_ADMIN_MENU);
          } else {
            setCurrentView(VIEW_MENU);
          }
        } else {
          setUser(null);
        }
        setIsCheckingSession(false);
      })
      .catch(() => {
        setUser(null);
        setIsCheckingSession(false);
      });
  }, []);

  function showMessage(type, text) {
    if (!text) {
      setGlobalMessage(null);
      return;
    }
    setGlobalMessage({
      id: Date.now(),
      type,
      text,
    });
  }

  function clearMessage() {
    setGlobalMessage(null);
  }

  function handleLoginSuccess(userInfo) {
    setUser(userInfo);
    setGlobalError('');
    setCartItems([]);

    if (userInfo.role === 'admin') {
      setCurrentView(VIEW_ADMIN_MENU);
    } else {
      setCurrentView(VIEW_MENU);
    }
  }

  function handleLogout() {
    setGlobalError('');
    setGlobalMessage(null);

    fetchJSON('/api/sessions', { method: 'DELETE' })
      .then(() => {
        setUser(null);
        setCartItems([]);
        setCurrentView(VIEW_MENU);
        setGlobalMessage(null);
      })
      .catch(() => {
        setUser(null);
        setCartItems([]);
        setCurrentView(VIEW_MENU);
        setGlobalMessage(null);
      });
  }

  function handleChangeView(view) {
    setCurrentView(view);
  }

  function handleSessionExpired() {
    setUser(null);
    setCartItems([]);
    setCurrentView(VIEW_MENU);
    setGlobalError('');
    setGlobalMessage(null);
  }

  if (isCheckingSession) {
    return (
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Online Ordering System</h1>
        </header>
        <main className="app__main">
          <p>Checking session...</p>
        </main>
      </div>
    );
  }

  let mainContent = null;

  if (!user) {
    mainContent = (
      <LoginPanel
        onLoginSuccess={handleLoginSuccess}
        onShowMessage={showMessage}
      />
    );
  } else if (user.role === 'admin') {
    if (currentView === VIEW_ADMIN_MENU) {
      mainContent = (
        <AdminMenuPage
          user={user}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    } else if (currentView === VIEW_ADMIN_ORDERS) {
      mainContent = (
        <AdminOrderPage
          user={user}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    } else {
      mainContent = (
        <AdminMenuPage
          user={user}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    }
  } else {
    if (currentView === VIEW_MENU) {
      mainContent = (
        <MenuAndCart
          user={user}
          cartItems={cartItems}
          onCartItemsChange={setCartItems}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    } else if (currentView === VIEW_ORDERS) {
      mainContent = (
        <OrderPage
          user={user}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    } else {
      mainContent = (
        <MenuAndCart
          user={user}
          cartItems={cartItems}
          onCartItemsChange={setCartItems}
          onShowMessage={showMessage}
          onSessionExpired={handleSessionExpired}
        />
      );
    }
  }

  return (
    <div className="app">
      <Header
        user={user}
        currentView={currentView}
        onChangeView={handleChangeView}
        onLogout={handleLogout}
      />

      <MessageBar
        message={globalMessage}
        globalError={globalError}
        onClear={clearMessage}
      />

      <main className="app__main">{mainContent}</main>
    </div>
  );
}

export default App;
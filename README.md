# Online Ordering System

This project is a small **online food ordering system** built with **React (Vite)** on the frontend and **Express** on the backend.

It demonstrates:

- React components calling REST-based services using `fetch`
- Vite dev server proxying `/api` requests to an Express server
- Session-based login and simple role-based views (customer vs admin)
- Basic cart management and order management flows

---

## What the Application Does

The application supports two roles:

### Customer

- View the menu of dishes (with image, name, description, category, and price)
- Filter dishes by category:
  - All / Main Dish / Side Dish / Drink / Dessert
- Add dishes to a **cart**
- Update quantities in the cart or remove items
- See the running **total price** of the cart
- Place an order based on the current cart contents
- View **My Orders**:
  - See list of past orders, their status, and totals
  - Cancel a **pending** order (with confirmation modal)

### Admin

- **Admin Menu Management**
  - View all menu items
  - Filter by category
  - Create new dishes
  - Edit existing dishes
  - Delete dishes (with confirmation)

- **Admin Order Management**
  - View all customer orders
  - Filter orders by status (All, Pending, Preparing, Ready, Completed, Canceled)
  - Change the status of an order according to allowed transitions  
    (e.g., `pending → preparing → ready → completed`, or `canceled`)
  - Orders automatically refresh every few seconds so new orders appear without manual reload

### Session Handling

- On first load, the app checks `GET /api/session` to see if the user is already logged in.
- If a session is missing or becomes invalid (e.g., cookie removed), protected API calls return `{"error": "auth-missing"}`, and the app:
  - Clears the user and cart
  - Returns to the login panel, instead of showing error popups like “Please log in again”.

Most functionality is discoverable directly from the UI via labeled buttons, tabs, and forms.

---

## How to Run the Project

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Install Dependencies

From the project root:

```bash
npm install

Development Mode

Start the Express service server (serves the /api endpoints):

npm run start

In another terminal, start the Vite dev server:

npm run dev

Then open the Vite URL in your browser, for example:

http://localhost:5173

The Vite dev server is configured to proxy any request starting with /api to the Express server.

Production Mode

Build the frontend:

npm run build

Then start the Express server (which serves both the built static files and the /api endpoints):

npm run start

Open the Express URL in your browser, for example:

http://localhost:3000


## Images and External Resources

- Food and drink photos in this project are from **Unsplash** (https://unsplash.com).
- These images are used under the **Unsplash License** (free to use, no attribution required), and are only used for this coursework project.

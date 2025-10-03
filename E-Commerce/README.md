    # E-commerce Admin Panel

## Features
- Admin authentication (JWT)
- CRUD operations for products
- Image upload & preview
- Product reviews & ratings
- Cart management
- Order management
- Stripe payment integration
- User management (admin only)

## Tech Stack
- React, React Router, Context API
- Node.js, Express, MongoDB, Mongoose
- JWT authentication, bcrypt
- Stripe payment gateway
- Axios for API calls

## Setup
1. Clone the repo
2. `npm install`
3. Configure `.env` with `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLIENT_URL`, `PORT`
4. Start backend: `npm run server`
5. Start frontend: `npm start`
6. Open http://localhost:3000/admin/login

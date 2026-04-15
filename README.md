<<<<<<< HEAD
# E-commerce Solution - React & MySQL

A modern, full-stack e-commerce application built with React, Node.js, and MySQL.

## 📋 Prerequisites

- **Node.js**: v20.19+ (recommended) or v22.12+ — Vite requires Node >= 20.19.
- **MySQL** (running locally or on a server)
- **Terminal**: Bash / Terminal

## 🚀 Quick Setup (short)

This project has two parts: the backend API (`backend`) and the frontend (`react-ecommerce`).

### 0. Upgrade Node (if needed)

If `node -v` shows older than v20.19 you may see errors such as `crypto.hash is not a function` when starting Vite. Use `nvm` to upgrade safely (per-user):

```bash
# install nvm (if not already installed)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "$HOME/.nvm" || printf %s "$XDG_CONFIG_HOME/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# install and use Node 20
nvm install 20
nvm use 20
nvm alias default 20

# verify
node -v
```

After upgrading Node, reinstall frontend dependencies (see Frontend section).

### 1. Database Setup (Linux)

Start MySQL and create the database + seed data. Example uses `root` with an example password `<YOUR_PASSWORD>`.

```bash
# Start MySQL service
sudo systemctl start mysql

# (Optional) change/set MySQL root password interactively
sudo mysql
-- Inside MySQL shell:
ALTER USER 'root'@'localhost' IDENTIFIED BY '<YOUR_PASSWORD>';
FLUSH PRIVILEGES;
EXIT;

# create DB
mysql -u root -p'<YOUR_PASSWORD>' -e "CREATE DATABASE IF NOT EXISTS ecommerce_solution;"

# import schema and seed
mysql -u root -p'<YOUR_PASSWORD>' ecommerce_solution < database/schema.sql
mysql -u root -p'<YOUR_PASSWORD>' ecommerce_solution < database/seed.sql
```

If you prefer interactive import, use `mysql -u root -p` and then `SOURCE ./database/schema.sql;` and `SOURCE ./database/seed.sql;` inside the MySQL prompt.

### 2. Backend Setup

Create a `backend/.env` file (example below), install packages and run the dev server:

```env
# backend/.env (example)
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<YOUR_PASSWORD>
DB_NAME=ecommerce_solution
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_this_secret
```

Commands:
```bash
cd backend
npm install
npm run dev
```

The backend listens on `http://localhost:5000` and health is at `http://localhost:5000/api/health`.

### 3. Frontend Setup

Create a `react-ecommerce/.env` file with your API URL and install packages:

```env
# react-ecommerce/.env
VITE_API_URL=http://localhost:5000/api
```

Commands (after upgrading Node to v20+):
```bash
cd react-ecommerce
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

---

## 🔐 Credentials & Test Accounts

- **DB user**: `root`
- **DB password (example shown above)**: `<YOUR_PASSWORD>` (replace with your chosen password)
- **Database**: `ecommerce_solution`

Pre-seeded test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **User** | `jils@user.com` | `abc@123` |
| **Seller** | `jils@seller.com` | `abc@123` |

---

## 🐛 Troubleshooting

- Vite error `crypto.hash is not a function`: upgrade Node to v20.19+ and reinstall frontend deps.
- MySQL connection errors: ensure `backend/.env` matches your MySQL credentials and MySQL is running.
- Unknown database: re-run the schema and seed imports.
- Port conflicts: change `PORT` in `backend/.env` or stop the process using the port.

If login fails, try signing up a new account via the app; seeded accounts are for convenience but may be changed by reseeding. 

---

## 🛠️ Project Structure

```
ecommerce_solution/
├── backend/            # Express.js API
├── react-ecommerce/    # React Frontend
├── database/           # SQL Schema & Seeds
└── README.md           # This file
```

## 🌟 Features

- **User**: Browse products, search, view details, authentication.
- **Seller**: Add/manage products and view seller orders.
- **Security**: JWT-based auth, sellers can access only their data.

=======
# spe-project
>>>>>>> a27c600536729b20ccb1eebba88d56176869c019

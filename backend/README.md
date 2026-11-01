# ThinkMart backend

The backend is a Spring Boot REST API backed by MySQL. It provides account
registration and session login, a database-backed product catalog, and a
per-account cart.

## Requirements

- Java 17 or newer
- MySQL 8 or newer

## Configure MySQL

Create the database once in MySQL:

```sql
CREATE DATABASE thinkmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set the connection settings in PowerShell before starting the API. The URL and
username default to `jdbc:mysql://localhost:3306/thinkmart` and `root`.

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
```

Hibernate creates or updates the application tables at startup. The initial
product catalog is inserted only when the products table is empty.

## Run the application

Start the backend from this directory:

```powershell
.\mvnw.cmd spring-boot:run
```

Serve the static frontend from the `frontend` directory in another terminal:

```powershell
Set-Location ..\frontend
py -m http.server 5500
```

Open `http://localhost:5500/index.html` (or use `127.0.0.1` consistently for
the frontend). The frontend uses the same host for its API request to port
`8080`, so the browser sends the CSRF cookie correctly. The API allows frontend origins at
`localhost:5500` and `127.0.0.1:5500` by default; change
`app.cors.allowed-origins` if the frontend is served from a different origin.

## API routes

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — start an authenticated session
- `GET /api/auth/me` — get the current account
- `POST /api/auth/logout` — end the current session
- `GET /api/products` — list products
- `GET /api/cart` — view the signed-in account's cart
- `POST /api/cart/items` — add a product (`productId`, `quantity`)
- `PUT /api/cart/items/{productId}` — change item quantity
- `DELETE /api/cart/items/{productId}` — remove an item

State-changing requests require the CSRF token returned by `GET /api/csrf`.
Passwords are stored as BCrypt hashes; cart and account data are persisted in
MySQL.

# Proyecto E-Commerce con GraphQL y Roles

Proyecto de aplicación web tipo **E-Commerce** desarrollado con **Node.js, Express, MongoDB y GraphQL**, que incluye autenticación JWT, gestión de usuarios con roles, carrito de compra, pedidos y un chat común entre usuarios conectados.

---

## 📌 Tecnologías utilizadas

### Backend
- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **GraphQL (Apollo Server)**
- **JWT (JSON Web Token)** para autenticación
- **Socket.IO** para chat en tiempo real

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript Vanilla**
- **Apollo Client** para consumo de GraphQL
- **Fetch API** para endpoints REST

---

## 📂 Estructura del proyecto

```
entrega-2/
│
├── public/
│ ├── index.html
│ ├── login.html
│ ├── register.html
│ ├── checkout.html
│ ├── order.html
│ ├── manageProducts.html
│ ├── manageUsers.html
│ ├── manageOrders.html
│ ├── editProduct.html
│ │
│ ├── styles.css
│ │
│ ├── client.js # Lógica principal + GraphQL Products
│ ├── order.js # Gestión de pedidos
│ ├── manageProducts.js
│ ├── manageUsers.js
│ ├── manageOrders.js
│ └── checkout.js
│
├── graphql/
│ ├── schema.js
│ └── resolvers.js
│
├── models/
│ ├── User.js
│ ├── Product.js
│ └── Order.js
│
├── routes/
│ ├── auth.routes.js
│ ├── products.routes.js
│ ├── orders.routes.js
│ └── users.routes.js
│
├── middleware/
│ ├── authMiddleware.js
│ └── roleMiddleware.js
│
├── server.js
└── README.md
```


---

## 👤 Roles y funcionalidades

### 🧑 Cliente
- Ver todos los productos
- Añadir productos al carrito
- Persistencia del carrito (LocalStorage + recuperación tras login)
- Realizar pedidos
- Ver sus propios pedidos
- Participar en el chat común

---

### 🚚 Logística
- Ver todos los productos
- Crear y editar productos
- Ver pedidos de todos los usuarios
- Cambiar el estado de los pedidos
- Acceso al chat común

---

### 👑 Administrador
- Todas las funciones de Logística
- Gestión completa de usuarios:
  - Listar usuarios
  - Cambiar roles
  - Eliminar usuarios
- Eliminar pedidos
- Acceso al chat común

---

## 🛍️ Flujo de uso de la aplicación

1. Usuario se registra o inicia sesión
2. Se valida el token JWT
3. Se redirige al panel según el rol
4. Cliente:
   - Añade productos al carrito
   - Finaliza compra → se crea una Order
5. Logística / Admin:
   - Visualizan pedidos
   - Cambian estado
6. Todos los usuarios:
   - Acceden al chat común

---

## 🔐 Autenticación

La autenticación se realiza mediante **JWT** usando endpoints REST:

- `POST /api/auth/register`
- `POST /api/auth/login`

El token se guarda en `sessionStorage` y se valida en cada vista.

---

## 📦 Modelos de datos (MongoDB)

### User
```js
{
  username: String,
  email: String,
  password: String,
  role: "Administrador" | "Logística" | "Cliente"
}
```

### Product
```
{
  title: String,
  description: String,
  price: Number,
  image: String
}
```
### Order
```
{
  userId: ObjectId,
  products: [
    {
      product: ObjectId,
      quantity: Number
    }
  ],
  total: Number,
  status: "Pendiente" | "Completado",
  createdAt: Date
}

```
---

## GraphQL
### Tipos principales
```
type Product {
  id: ID!
  title: String!
  description: String!
  price: Float!
  image: String
}

type OrderProduct {
  product: Product!
  quantity: Int!
}

type Order {
  id: ID!
  userId: ID!
  products: [OrderProduct!]!
  total: Float!
  status: String!
  createdAt: String!
}
```

## Queries
### Obtener productos
```
query GetProducts {
  products {
    id
    title
    description
    price
    image
  }
}

```
### Obtener todos los pedidos
```
query GetOrders {
  orders {
    id
    userId
    total
    status
    createdAt
  }
}
```
### Obtener detalle de un pedido
```
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    status
    total
    createdAt
    products {
      quantity
      product {
        title
        price
      }
    }
  }
}
```
## Mutations
### Crear producto
```
mutation CreateProduct($title: String!, $description: String!, $price: Float!) {
  createProduct(
    title: $title,
    description: $description,
    price: $price
  ) {
    id
    title
  }
}
```
### Actualizar producto
```
mutation UpdateProduct($id: ID!, $price: Float) {
  updateProduct(id: $id, price: $price) {
    id
    price
  }
}
```
### Eliminar producto
```
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id)
}
```
### Actualizar estado de pedido
```
mutation UpdateOrderStatus($id: ID!, $status: String!) {
  updateOrderStatus(id: $id, status: $status) {
    id
    status
  }
}
```
---

## Chat en tiempo real

- Implementado con Socket.IO
- Todos los usuarios con sesión activa pueden comunicarse
- Identificación por username
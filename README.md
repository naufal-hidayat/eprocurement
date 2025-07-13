E-Procurement API
This is a simple REST API for an E-Procurement system built with Node.js and MongoDB.
#VIBECODING
Features
- User Registration and Login
- Vendor Registration
- Product Catalog Management (CRUD)
API Endpoints
User Endpoints
POST /register
  Register a new user.
  Request:
  {"email": "user@example.com", "password": "password123"}
POST /login
  Login to get a JWT token.
  Request:
  {"email": "user@example.com", "password": "password123"}
Vendor Endpoints
POST /vendor/register
  Register a new vendor.
  Request:
  {"name": "Vendor A", "contactInfo": "contact@vendora.com", "userId": "user_id_here"}
GET /vendor/:userId
  Get vendor details by userId.
Product Endpoints
POST /product
  Create a new product.
  Request:
  {"name": "Product 1", "description": "Description", "price": 100, "vendorId": "vendor_id_here"}
GET /products/:vendorId
  Get all products by vendorId.
PUT /product/:id
  Update a product by id.
  Request:
  {"name": "Updated Product", "description": "Updated description", "price": 150}
DELETE /product/:id
  Delete a product by id.
Installation
1. Clone the repository:
   git clone https://github.com/your-username/eprocurement-api.git
2. Install dependencies:
   npm install
3. Start the server:
   npm start
The API will be running at http://localhost:5000.
Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
License
MIT License

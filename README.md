# Shop Ease - Server
[Client-side-repo](https://github.com/codebyahadul/shop-ease-client.git)
This is the backend server for the Shop Ease application. It handles API requests, manages data storage, and integrates with Firebase.

## Installation

To run the server locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/codebyahadul/shop-ease-server.git

2. Navigate to the server directory:
    ```bash
    cd shop-ease-server
3. Set up the necessary environment variables by creating a .env file in the root directory with the following variables:
    -PORT: The port on which the server will run (e.g., 5000).
    -MONGODB_URI: The URI for your MongoDB database connection. Replace your_mongodb_connection_string_here with your actual MongoDB connection string.
    -Any other environment variables specific to your application setup.
4. Install dependencies:
   ```bash
   npm install
5. Start the development server:
   ```bash
   npm run dev

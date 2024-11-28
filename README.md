
<div align="center">
<img width="150" alt="saleor-app-template" src="https://user-images.githubusercontent.com/4006792/215185065-4ef2eda4-ca71-48cc-b14b-c776e0b491b6.png">
</div>

<div align="center">
  <h1>Saleor Example Anonymization App</h1>
</div>

<div align="center">
  <p>This app helps anonymize customer data securely and efficiently.</p>
</div>

<div align="center">
  <a href="https://saleor.io/">Website</a>
  <span> | </span>
  <a href="https://docs.saleor.io/docs/3.x/">Docs</a>
  <span> | </span>
    <a href="https://githubbox.com/saleor/saleor-app-template">CodeSandbox</a>
</div>

---

## **Overview**

This application anonymizes customer data, focusing on the following:
- Scrambles user details (e.g., names, emails, and phone numbers).
- Updates user orders with anonymized data.
- Deletes the customer profile after anonymization (optional).
- Integrated with Saleor via GraphQL API.

---

## **Table of Contents**
- [Features](#features)
- [Requirements](#requirements)
- [Setup Instructions](#setup-instructions)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Development](#development)
  - [Production](#production)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
- [Docker Setup](#docker-setup)
  - [Development Docker](#development-docker)
  - [Production Docker](#production-docker)
- [Project Structure](#project-structure)

---

## **Features**

- Fetches user and order data using GraphQL APIs.
- Updates orders with anonymized details:
  - First Name, Last Name → Replaced with placeholders.
  - Email → Converted to a UUID-based format.
  - Phone → Replaced with a non-functional number.
- Deletes customer data post-anonymization.

---

## **Requirements**

Ensure the following are installed before starting:
- [Node.js (16+)](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Saleor CLI](https://docs.saleor.io/docs/3.x/cli) (optional)

---

## **Setup Instructions**

### **Environment Variables**

Set the environment variable in a `.env.local` file:
```env
NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN=yourdomain.com
```

**Variable Explanation:**
- `NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN`: Specifies the domain for anonymized email addresses. Defaults to `example.com`.

### **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/anonymization-app.git
   cd anonymization-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

---

## **Running the Application**

### **Development**

1. Start the application in development mode:
   ```bash
   pnpm dev
   ```

2. Expose your local server:
   Use a tunneling tool like [ngrok](https://ngrok.com/) to expose your local server for Saleor.

3. Install the application via Saleor Dashboard:
   ```
   [YOUR_SALEOR_DASHBOARD_URL]/apps/install?manifestUrl=[YOUR_APP_TUNNEL_MANIFEST_URL]/api/manifest
   ```

### **Production**

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

---

## **Testing**

### **Unit Tests**

Run unit tests:
```bash
pnpm test
```

### **Environment for Testing**

Ensure `.env.test` is set up for testing:
```env
NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN=testdomain.com
```

---

## **Docker Setup**

### **Development Docker**

1. Build the development image:
   ```bash
   docker build -t anonymization-app-dev -f Dockerfile.dev .
   ```

2. Run the development container:
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app anonymization-app-dev
   ```

### **Production Docker**

1. Build the production image:
   ```bash
   docker build -t anonymization-app-prod -f Dockerfile.prod .
   ```

2. Run the production container:
   ```bash
   docker run -p 3000:3000 anonymization-app-prod
   ```

---

## **Project Structure**
```plaintext
.
├── src
│   ├── ScrambleAllOrdersByEmail.tsx   # Main Component
├── tests
│   ├── unit
│   │   └── scramble-all-orders-by-email.test.ts   # Unit Tests
├── Dockerfile.dev                          # Development Dockerfile
├── Dockerfile.prod                         # Production Dockerfile
├── .env.local                              # Environment Variables
├── .env.test                               # Test Environment Variables
├── vitest.config.ts                        # Vitest Configuration
```


# Odoo POS System

A full-stack Point of Sale (POS) system enabling real-time order management, kitchen synchronization, and seamless customer interactions.

---

## Overview

### Purpose

Odoo POS System is a modern, full-stack application designed to streamline restaurant and cafe operations. It provides a unified interface for managing orders, payments, and kitchen workflows.

### Problem Statement

Traditional POS systems often lack real-time synchronization between front-of-house and kitchen operations, leading to inefficiencies, delays, and order mismatches.

### Key Capabilities

* Real-time order processing
* Kitchen display system with live updates
* QR-based ordering support
* Modular frontend and backend architecture
* RESTful API with interactive documentation

---

## Architecture

### High-Level Design

The system follows a client-server architecture:

* **Frontend**: React-based UI for POS operations and dashboards
* **Backend**: FastAPI service handling business logic and APIs
* **Database**: PostgreSQL for persistent storage
* **Realtime Layer**: WebSockets for live kitchen updates

### Component Interaction

```
[Client (React)]
        |
        v
[FastAPI Backend] ----> [PostgreSQL Database]
        |
        v
[WebSocket Layer] ---> [Kitchen Display]
```

---

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React, Tailwind CSS, Vite |
| Backend  | FastAPI (Python)          |
| Database | PostgreSQL                |
| Realtime | WebSockets                |
| Tooling  | Node.js, npm, pip         |

---

## Getting Started

### Prerequisites

* Node.js (>= 18.x)
* Python (>= 3.10)
* PostgreSQL (or SQLite for local development)

---

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/ShivamKadavla37/odoo-pos-sys.git
cd odoo-pos-sys
```

#### 2. Setup Frontend

```bash
cd frontend
npm install
```

#### 3. Setup Backend

```bash
cd ../backend
pip install -r requirements.txt
```

---

## Configuration

### Environment Variables

| Variable     | Description                | Required |
| ------------ | -------------------------- | -------- |
| DATABASE_URL | Database connection string | Yes      |
| SECRET_KEY   | Application secret key     | Yes      |
| DEBUG        | Enable debug mode          | No       |

Create a `.env` file in the backend directory and configure the above variables.

---

### External Dependencies

* PostgreSQL database (recommended for production)
* Optional: Redis (for scaling WebSocket layer)

---

## Usage

### Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Run Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://127.0.0.1:8000`

---

### Sample Workflow

1. Launch backend service
2. Start frontend application
3. Access POS dashboard
4. Create and manage orders
5. Monitor kitchen updates in real-time

---

## API Documentation

Interactive API docs available at:

```
http://127.0.0.1:8000/docs
```

### Example Endpoint

#### Create Order

**POST** `/orders`

**Request Body**

```json
{
  "items": [
    {"product_id": 1, "quantity": 2}
  ]
}
```

**Response**

```json
{
  "order_id": 101,
  "status": "created"
}
```

---

## Project Structure

```
odoo-pos-sys/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── utils/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Testing

### Running Tests

```bash
# Backend tests (if implemented)
pytest

# Frontend tests (if implemented)
npm test
```

### Testing Strategy

* Unit testing for backend services
* Component testing for frontend UI
* API contract validation

---

## Deployment

### Build Process

Frontend:

```bash
npm run build
```

Backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### CI/CD Considerations

* Automated linting and testing
* Build validation before deployment
* Environment-specific configurations

### Supported Environments

* Local development
* Cloud deployment (Vercel, Render, etc.)

---

## Security Considerations

* Do not commit `.env` files
* Use secure secret management for production
* Validate all API inputs
* Implement authentication and authorization

---

## Performance & Scalability

* Use connection pooling for database
* Scale backend horizontally
* Introduce caching (Redis) for high load
* Optimize frontend bundle size

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a pull request

### Code Standards

* Follow consistent naming conventions
* Write modular, reusable code
* Maintain code readability and documentation

### Pull Request Guidelines

* Include description of changes
* Reference related issues
* Ensure tests pass

---

## License

MIT License

---

## Maintainers / Authors

* HackStack
* Contributors (open to collaboration)

---

## Notes

* This project is designed as a scalable foundation for POS systems.
* Additional enterprise features (authentication, analytics, multi-tenant support) can be integrated.

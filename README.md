# ByteBasket: A Food Bank Assistance Web Application

ByteBasket is a comprehensive web application designed to streamline food bank operations, connecting donors, volunteers, and recipients in an efficient ecosystem.

## Repository Structure

This repository is organized into the following main directories:

- `Documentation/` - Contains all project documentation
- `Templates/` - Contains GitHub issue templates
- `backend/` - Contains the Node.js/Express backend application
- `frontend/` - Contains the React frontend application

## Getting Started

1. Clone this repository
2. Set up the backend by following instructions in `backend/README.md`
3. Set up the frontend by following instructions in `frontend/README.md`

## Team

- Ahnaf Abrar Khan (Old Team)
- Arashdeep Singh
- Claudia Suarez Socorro 
- Davyd Kuleba (Old Team)
- Kavya Bhavinkumar Shah
- Saeed Bafana 
- Ulas Cagin Ondev 


## Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- JWT authentication
- Input validation & rate limiting

**Frontend:**
- React 18 with hooks
- Tailwind CSS styling
- Lucide React icons
- Responsive design

## Quick Start

1. **Clone and setup:**
```bash
git clone <repository>
cd bytebasket
```

2. **Start with Docker:**
```bash
docker-compose up -d
```

3. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## API Endpoints

```
GET    /api/inventory              # List inventory with filters
POST   /api/inventory              # Create new item
GET    /api/inventory/:id          # Get single item
PUT    /api/inventory/:id          # Update item
DELETE /api/inventory/:id          # Delete item
GET    /api/inventory/alerts/low-stock    # Low stock alerts
GET    /api/inventory/alerts/expiring     # Expiring items
GET    /api/inventory/meta/categories     # Available categories
GET    /api/inventory/meta/dietary-categories # Dietary categories
```

## Database Schema

Uses existing ByteBasket schema with:
- `inventory` table with full CRUD support
- `dietary_category_enum` for dietary restrictions
- `foodbanks` table for multi-location support
- Automatic low stock detection
- Expiration tracking

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## Production Deployment

1. Set environment variables from `.env.example`
2. Build and deploy containers
3. Run database migrations
4. Configure reverse proxy/load balancer


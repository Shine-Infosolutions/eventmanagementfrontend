# Event Pass System - New Year 2025

## Overview
A frontend-only Event Pass Management System for New Year 2025 celebrations. Built with React + Vite and Tailwind CSS.

## Pass Types

### 1. Teens Pass
- **Price**: ₹500
- **Capacity**: 1 person
- **Age Group**: 13-19 years
- **Target**: School/college students

### 2. Couple Pass
- **Price**: ₹800
- **Capacity**: 2 persons
- **Target**: Couples or two friends

### 3. Family Pass
- **Price**: ₹1500
- **Capacity**: 4 persons (fixed limit)
- **Target**: Families

## Data Structure

### Pass Types
```javascript
{
  id: number,
  name: string,
  price: number,
  maxPeople: number,
  description: string,
  icon: string
}
```

### Bookings
```javascript
{
  id: string,              // Format: NY2025-XXXXXX
  passTypeId: number,
  passType: string,
  buyerName: string,
  buyerPhone: string,
  totalPeople: number,
  price: number,
  paymentStatus: string,   // Paid/Pending/Refunded
  paymentMode: string,     // Cash/UPI/Card/Online
  createdAt: string,
  qrCodeValue: string,
  notes: string,
  checkedIn: boolean,
  checkedInAt: string,
  scannedBy: string,
  peopleEntered: number
}
```

## User Roles

### 1. Admin
- View dashboard with statistics
- Sell new passes
- View all bookings
- Gate entry management

### 2. Sales Staff
- Sell new passes
- View their sales (bookings)

### 3. Gate Staff
- Gate entry screen
- QR code scanning
- Check-in management

## Features

### Dashboard
- Total passes sold
- Revenue tracking
- Pass type breakdown
- Check-in statistics
- Quick action buttons

### Sell Pass
- Pass type selection with visual cards
- Buyer information form
- Payment mode selection
- Automatic pass ID and QR generation

### Booking Management
- Search and filter bookings
- View booking details
- Status tracking
- Export capabilities (future)

### Gate Entry
- QR code scanning simulation
- Manual search by:
  - Pass ID
  - Phone number
  - Buyer name
- Check-in process
- Duplicate entry prevention

## Reusable Components

### UI Components
- **Button**: Multiple variants (primary, secondary, success, danger, outline)
- **Card**: Consistent layout wrapper
- **Input**: Form input with validation
- **Badge**: Status indicators
- **Modal**: Popup dialogs
- **QRDisplay**: QR code visualization

### Business Components
- **Header**: Navigation and user info
- **Sidebar**: Role-based navigation
- **ProtectedRoute**: Authentication wrapper

## Technology Stack
- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 6.30.2
- **State**: React Context API
- **Storage**: localStorage (frontend-only)

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Default Users
The system includes default users for testing:
- Admin: Full access
- Sales: Pass selling and booking view
- Gate: Entry management only

## Future Enhancements
- Real QR code generation library
- PDF pass generation
- SMS/WhatsApp integration
- Excel/CSV export
- Real-time updates
- Payment gateway integration
- Advanced reporting
- Multi-event support

## File Structure
```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── pages/              # Main application pages
├── layout/             # Layout components
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Key Features for Extension
- Modular component architecture
- Centralized state management
- Role-based access control
- Responsive design
- Consistent UI patterns
- Easy data structure modification
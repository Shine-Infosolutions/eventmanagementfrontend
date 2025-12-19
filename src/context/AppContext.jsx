import { createContext, useContext, useState, useEffect } from 'react';
import { FiUser, FiUsers, FiHome } from 'react-icons/fi';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  const passTypes = {
    Teens: { 
      id: 1,
      name: 'Teens',
      price: 500, 
      maxPeople: 1, 
      description: '1 person, age 13-19',
      icon: FiUser
    },
    Couple: { 
      id: 2,
      name: 'Couple',
      price: 800, 
      maxPeople: 2, 
      description: '2 persons',
      icon: '💑'
    },
    Family: { 
      id: 3,
      name: 'Family',
      price: 1500, 
      maxPeople: 4, 
      description: '4 persons (fixed limit)',
      icon: '👨‍👩‍👧‍👦'
    }
  };

  const generatePassId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NY2025-${timestamp}${random}`;
  };

  const generateQRCode = (passId) => {
    return `QR-${passId}-${Date.now()}`;
  };

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(savedBookings);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addBooking = (bookingData) => {
    const booking = {
      id: generatePassId(),
      passTypeId: bookingData.passTypeId,
      passType: bookingData.passType,
      buyerName: bookingData.buyerName,
      buyerPhone: bookingData.buyerPhone,
      totalPeople: bookingData.totalPeople,
      price: bookingData.price,
      paymentStatus: bookingData.paymentStatus || 'Paid',
      paymentMode: bookingData.paymentMode,
      createdAt: new Date().toISOString(),
      qrCodeValue: generateQRCode(generatePassId()),
      notes: bookingData.notes || '',
      checkedIn: false,
      checkedInAt: null,
      scannedBy: null,
      peopleEntered: 0
    };
    
    const updatedBookings = [...bookings, booking];
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    return booking;
  };

  const updateBooking = (bookingId, updates) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, ...updates } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  const value = {
    user,
    setUser,
    bookings,
    setBookings,
    passTypes,
    addBooking,
    updateBooking,
    generatePassId,
    generateQRCode
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
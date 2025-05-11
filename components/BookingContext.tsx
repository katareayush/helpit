import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the booking type
export interface IncomingBooking {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  serviceId: {
    _id: string;
    name: string;
  };
  details: string;
  status: 'PENDING';
  estimatedFare: number;
  createdAt: string;
}

// Define context type
interface BookingContextType {
  incomingBooking: IncomingBooking | null;
  setIncomingBooking: (booking: IncomingBooking) => void;
  clearIncomingBooking: () => void;
}

// Create context with default values
const BookingContext = createContext<BookingContextType>({
  incomingBooking: null,
  setIncomingBooking: () => {},
  clearIncomingBooking: () => {},
});

// Create hook for easier context consumption
export const useBooking = () => useContext(BookingContext);

// Context provider component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incomingBooking, setIncomingBooking] = useState<IncomingBooking | null>(null);

  // Set a new incoming booking
  const handleSetIncomingBooking = (booking: IncomingBooking) => {
    setIncomingBooking(booking);
  };

  // Clear the current incoming booking
  const clearIncomingBooking = () => {
    setIncomingBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
        incomingBooking,
        setIncomingBooking: handleSetIncomingBooking,
        clearIncomingBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
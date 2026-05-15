import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateBookingStatusRealtime } from '../store/slices/bookingSlice';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchIdState, setWatchIdState] = useState(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      // Connect to Socket.io server
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const newSocket = io(API_URL.replace('/api', ''), {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket.io connected');
        if (user && user.role === 'technician') {
          newSocket.emit('join-technician', user._id);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      // Listen for booking status updates
      newSocket.on('booking-status-updated', (data) => {
        console.log('Booking status updated:', data);
        dispatch(updateBookingStatusRealtime(data));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, dispatch]);

  const joinBookingRoom = (bookingId) => {
    if (socket) {
      socket.emit('join-booking', bookingId);
    }
  };

  const leaveBookingRoom = (bookingId) => {
    if (socket) {
      socket.emit('leave-booking', bookingId);
    }
  };

  const updateLocation = (bookingId, coordinates) => {
    if (socket) {
      socket.emit('update-location', { bookingId, coordinates });
    }
  };

  const startLocationTracking = (technicianId) => {
    setIsTracking(true);
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coordinates = [longitude, latitude]; // GeoJSON format: [lng, lat]
          if (socket) {
            socket.emit('technician-location-update', { technicianId, coordinates }, (response) => {
               if (response && response.success) {
                  setLocationAcquired(true);
                  setLocationError(null);
               } else {
                  console.error('Failed to save location to DB');
                  setLocationError('Failed to save location on server');
               }
            });
          } else {
            setLocationAcquired(true);
            setLocationError(null);
          }
        },
        (error) => {
          console.error('Error tracking location:', error);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchIdState(watchId);
      
      // Return a cleanup function
      return () => {
         navigator.geolocation.clearWatch(watchId);
         setIsTracking(false);
         setLocationAcquired(false);
      };
    } else {
      setLocationError('Geolocation not supported by browser');
    }
    return () => setIsTracking(false);
  };

  const stopLocationTracking = () => {
    if (watchIdState !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdState);
    }
    setIsTracking(false);
    setLocationAcquired(false);
    setWatchIdState(null);
  };

  const value = {
    socket,
    joinBookingRoom,
    leaveBookingRoom,
    updateLocation,
    startLocationTracking,
    stopLocationTracking,
    locationAcquired,
    locationError,
    isTracking,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import serviceReducer from './slices/serviceSlice';
import bookingReducer from './slices/bookingSlice';
import wastePickupReducer from './slices/wastePickupSlice';
import emergencyReducer from './slices/emergencySlice';
import materialsReducer from './slices/materialsSlice';

// Persist config
const persistConfig = {
  key: 'karyfix-auth',
  storage,
  whitelist: ['user', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    services: serviceReducer,
    bookings: bookingReducer,
    wastePickup: wastePickupReducer,
    emergency: emergencyReducer,
    materials: materialsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

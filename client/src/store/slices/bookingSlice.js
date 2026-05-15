import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/bookings`,
        bookingData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create booking';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify Payment
export const verifyPayment = createAsyncThunk(
  'bookings/verifyPayment',
  async (paymentData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${paymentData.bookingId}/verify-payment`,
        paymentData,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to verify payment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my bookings
export const getMyBookings = createAsyncThunk(
  'bookings/getMyBookings',
  async (params = {}, thunkAPI) => {
    try {
      const { status, page, limit } = params;
      const queryParams = new URLSearchParams();

      if (status) queryParams.append('status', status);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const response = await axios.get(
        `${API_URL}/bookings/my-bookings?${queryParams.toString()}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch bookings';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get booking by ID
export const getBookingById = createAsyncThunk(
  'bookings/getBookingById',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${id}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch booking';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status, note }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}/status`,
        { status, note },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update booking status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update booking price
export const updateBookingPrice = createAsyncThunk(
  'bookings/updateBookingPrice',
  async ({ id, finalPrice }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}/price`,
        { finalPrice },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update booking price';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add photos to booking
export const addBookingPhotos = createAsyncThunk(
  'bookings/addBookingPhotos',
  async ({ id, photos }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${id}/photos`,
        { photos },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to add photos';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add review to booking
export const addBookingReview = createAsyncThunk(
  'bookings/addBookingReview',
  async ({ id, score, review }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${id}/review`,
        { score, review },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to add review';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get available bookings
export const getAvailableBookings = createAsyncThunk(
  'bookings/getAvailableBookings',
  async (params = {}, thunkAPI) => {
    try {
      const { categoryId, page, limit } = params;
      const queryParams = new URLSearchParams();
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const response = await axios.get(
        `${API_URL}/bookings/available?${queryParams.toString()}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch available bookings';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Request booking
export const requestBooking = createAsyncThunk(
  'bookings/requestBooking',
  async (id, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}/request`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to request booking';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Approve booking request
export const approveBookingRequest = createAsyncThunk(
  'bookings/approveBookingRequest',
  async (id, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}/approve`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to approve booking request';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ============ ADMIN/MANAGER ACTIONS ============

// Get all bookings
export const getAllBookings = createAsyncThunk(
  'bookings/getAllBookings',
  async (params = {}, thunkAPI) => {
    try {
      const { status, categoryId, technicianId, page, limit } = params;
      const queryParams = new URLSearchParams();

      if (status) queryParams.append('status', status);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (technicianId) queryParams.append('technicianId', technicianId);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const response = await axios.get(
        `${API_URL}/bookings/admin/all?${queryParams.toString()}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch bookings';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get booking statistics
export const getBookingStats = createAsyncThunk(
  'bookings/getBookingStats',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/admin/stats`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch booking statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Assign technician to booking
export const assignTechnician = createAsyncThunk(
  'bookings/assignTechnician',
  async ({ id, technicianId }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}/assign`,
        { technicianId },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to assign technician';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  bookings: [],
  availableBookings: [],
  selectedBooking: null,
  stats: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },
  isLoading: false,
  error: null,
  message: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.pagination = {
        page: 1,
        pages: 1,
        total: 0,
        count: 0,
      };
    },
    // Real-time update from Socket.io
    updateBookingStatusRealtime: (state, action) => {
      const { bookingId, status, statusTimeline } = action.payload;

      // Update in bookings list
      const bookingIndex = state.bookings.findIndex((b) => b._id === bookingId);
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = status;
        state.bookings[bookingIndex].statusTimeline = statusTimeline;
      }

      // Update selected booking if it matches
      if (state.selectedBooking && state.selectedBooking._id === bookingId) {
        state.selectedBooking.status = status;
        state.selectedBooking.statusTimeline = statusTimeline;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings.unshift(action.payload.data);
        // We only set the success message if it's a cash booking.
        // For online bookings, the UI handles the success message after verifyPayment.
        if (!action.payload.razorpayOrder) {
           state.message = 'Booking created successfully';
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the booking in state
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.message = 'Payment verified successfully!';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get my bookings
      .addCase(getMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        };
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get booking by ID
      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
        state.message = 'Booking status updated successfully';
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update booking price
      .addCase(updateBookingPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBookingPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
        state.message = 'Booking price updated successfully';
      })
      .addCase(updateBookingPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add photos
      .addCase(addBookingPhotos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookingPhotos.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
        state.message = 'Photos added successfully';
      })
      .addCase(addBookingPhotos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add review
      .addCase(addBookingReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookingReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
        state.message = 'Review added successfully';
      })
      .addCase(addBookingReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all bookings (admin)
      .addCase(getAllBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        };
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get booking stats
      .addCase(getBookingStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getBookingStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Assign technician
      .addCase(assignTechnician.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
        state.message = 'Technician assigned successfully';
      })
      .addCase(assignTechnician.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get available bookings
      .addCase(getAvailableBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAvailableBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableBookings = action.payload.data;
      })
      .addCase(getAvailableBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Request booking
      .addCase(requestBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Remove from available bookings
        state.availableBookings = state.availableBookings.filter(b => b._id !== action.payload.data._id);
        // Optionally add to my bookings with 'requested' status?
        // state.bookings.unshift(action.payload.data); 
      })
      .addCase(requestBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve booking request
      .addCase(approveBookingRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveBookingRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Update in bookings list if present
        const index = state.bookings.findIndex(b => b._id === action.payload.data._id);
        if (index !== -1) {
          state.bookings[index] = action.payload.data;
        }
      })
      .addCase(approveBookingRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearSelectedBooking,
  clearBookings,
  updateBookingStatusRealtime,
} = bookingSlice.actions;

export default bookingSlice.reducer;

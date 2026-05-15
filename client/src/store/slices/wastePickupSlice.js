import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const createWastePickup = createAsyncThunk(
  'wastePickup/create',
  async (pickupData, { rejectWithValue }) => {
    try {
      const response = await api.post('/waste/pickup', pickupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create pickup request');
    }
  }
);

export const getMyWastePickups = createAsyncThunk(
  'wastePickup/getMine',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/waste/pickup');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pickups');
    }
  }
);

export const getWastePickupById = createAsyncThunk(
  'wastePickup/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/waste/pickup/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pickup');
    }
  }
);

export const getPendingPickups = createAsyncThunk(
  'wastePickup/getPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/waste/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending pickups');
    }
  }
);

export const updateWasteStatus = createAsyncThunk(
  'wastePickup/updateStatus',
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/waste/pickup/${id}`, statusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const getWasteStats = createAsyncThunk(
  'wastePickup/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/waste/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const initialState = {
  pickups: [],
  pendingPickups: [],
  selectedPickup: null,
  stats: null,
  isLoading: false,
  error: null,
  message: null,
};

const wastePickupSlice = createSlice({
  name: 'wastePickup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedPickup: (state) => {
      state.selectedPickup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create pickup
      .addCase(createWastePickup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWastePickup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pickups.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createWastePickup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get my pickups
      .addCase(getMyWastePickups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyWastePickups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pickups = action.payload.data;
      })
      .addCase(getMyWastePickups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get by ID
      .addCase(getWastePickupById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWastePickupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPickup = action.payload.data;
      })
      .addCase(getWastePickupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get pending
      .addCase(getPendingPickups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingPickups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingPickups = action.payload.data;
      })
      .addCase(getPendingPickups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateWasteStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateWasteStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Update in arrays
        const updatedPickup = action.payload.data;
        state.pickups = state.pickups.map(p => 
          p._id === updatedPickup._id ? updatedPickup : p
        );
        state.pendingPickups = state.pendingPickups.filter(p => 
          p._id !== updatedPickup._id || !['completed', 'cancelled'].includes(updatedPickup.status)
        );
      })
      .addCase(updateWasteStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get stats
      .addCase(getWasteStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWasteStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getWasteStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearSelectedPickup } = wastePickupSlice.actions;
export default wastePickupSlice.reducer;

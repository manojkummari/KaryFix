import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const triggerSOS = createAsyncThunk(
  'emergency/triggerSOS',
  async (sosData, { rejectWithValue }) => {
    try {
      const response = await api.post('/emergency/sos', sosData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to trigger SOS');
    }
  }
);

export const getActiveAlerts = createAsyncThunk(
  'emergency/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/emergency/active');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'emergency/acknowledge',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/emergency/${id}/ack`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge');
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'emergency/resolve',
  async ({ id, resolutionNotes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/emergency/${id}/resolve`, { resolutionNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve');
    }
  }
);

const initialState = {
  activeAlerts: [],
  myAlerts: [],
  isLoading: false,
  sosTriggered: false,
  error: null,
  message: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetSOSState: (state) => {
      state.sosTriggered = false;
    },
    addAlert: (state, action) => {
      state.activeAlerts.unshift(action.payload);
    },
    updateAlertStatus: (state, action) => {
      const { alertId, status } = action.payload;
      state.activeAlerts = state.activeAlerts.map((a) =>
        a._id === alertId ? { ...a, status } : a
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Trigger SOS
      .addCase(triggerSOS.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(triggerSOS.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sosTriggered = true;
        state.message = action.payload.message;
      })
      .addCase(triggerSOS.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get active alerts
      .addCase(getActiveAlerts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeAlerts = action.payload.data;
      })
      .addCase(getActiveAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Acknowledge
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.activeAlerts = state.activeAlerts.map((a) =>
          a._id === updated._id ? updated : a
        );
      })
      // Resolve
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const resolved = action.payload.data;
        state.activeAlerts = state.activeAlerts.filter((a) => a._id !== resolved._id);
      });
  },
});

export const { clearError, clearMessage, resetSOSState, addAlert, updateAlertStatus } = emergencySlice.actions;
export default emergencySlice.reducer;

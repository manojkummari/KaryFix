import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Registration failed' }
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Login failed' }
      );
    }
  }
);

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getMe();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Failed to load user' }
      );
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.logout();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Logout failed' }
      );
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const data = await authService.forgotPassword(email);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          message: 'Failed to send reset email',
        }
      );
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetToken, password }, { rejectWithValue }) => {
    try {
      const data = await authService.resetPassword(resetToken, password);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Password reset failed' }
      );
    }
  }
);

// Update password
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const data = await authService.updatePassword(passwords);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: 'Failed to update password' }
      );
    }
  }
);

// Wallet: Create Add Money Order
export const createAddMoneyOrder = createAsyncThunk(
  'auth/createAddMoneyOrder',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/add-money`, { amount }, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || { message: 'Failed to create order' });
    }
  }
);

// Wallet: Verify Add Money
export const verifyAddMoney = createAsyncThunk(
  'auth/verifyAddMoney',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/verify`, paymentData, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || { message: 'Failed to verify payment' });
    }
  }
);

// Wallet: Update Bank Details
export const updateBankDetails = createAsyncThunk(
  'auth/updateBankDetails',
  async (bankData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/wallet/bank-details`, bankData, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || { message: 'Failed to update bank details' });
    }
  }
);

// Wallet: Withdraw Funds
export const withdrawFunds = createAsyncThunk(
  'auth/withdrawFunds',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/withdraw`, { amount }, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || { message: 'Failed to withdraw funds' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = 'Password updated successfully!';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Add Money
      .addCase(verifyAddMoney.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAddMoney.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.wallet.balance = action.payload.data.balance;
          state.user.wallet.transactions = action.payload.data.transactions;
        }
      })
      .addCase(verifyAddMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Bank Details
      .addCase(updateBankDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBankDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.bankDetails = action.payload;
        }
      })
      .addCase(updateBankDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Withdraw Funds
      .addCase(withdrawFunds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.wallet.balance = action.payload.balance;
          state.user.wallet.transactions = action.payload.transactions;
        }
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, resetAuth } = authSlice.actions;
export default authSlice.reducer;

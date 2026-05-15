import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const getMaterials = createAsyncThunk(
  'materials/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/materials${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const getMaterialById = createAsyncThunk(
  'materials/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material');
    }
  }
);

export const createOrder = createAsyncThunk(
  'materials/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/materials/order', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'materials/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/materials/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

const initialState = {
  materials: [],
  selectedMaterial: null,
  cart: [],
  orders: [],
  isLoading: false,
  error: null,
  message: null,
  orderSuccess: false,
};

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetOrderSuccess: (state) => {
      state.orderSuccess = false;
    },
    addToCart: (state, action) => {
      const { material, quantity } = action.payload;
      const existingItem = state.cart.find((item) => item.materialId === material._id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({
          materialId: material._id,
          name: material.name,
          price: material.price,
          unit: material.unit,
          image: material.image,
          quantity,
        });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.materialId !== action.payload);
    },
    updateCartQuantity: (state, action) => {
      const { materialId, quantity } = action.payload;
      const item = state.cart.find((i) => i.materialId === materialId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get materials
      .addCase(getMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.data;
      })
      .addCase(getMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get by ID
      .addCase(getMaterialById.fulfilled, (state, action) => {
        state.selectedMaterial = action.payload.data;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload.data);
        state.message = action.payload.message;
        state.orderSuccess = true;
        state.cart = [];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMessage,
  resetOrderSuccess,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = materialsSlice.actions;

export default materialsSlice.reducer;

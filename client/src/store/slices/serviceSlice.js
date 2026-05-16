import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get all categories
export const getCategories = createAsyncThunk(
  'services/getCategories',
  async (params = {}, thunkAPI) => {
    try {
      const { featured, active } = params;
      const queryParams = new URLSearchParams();

      if (featured !== undefined) queryParams.append('featured', featured);
      if (active !== undefined) queryParams.append('active', active);

      const response = await api.get(`/services/categories?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch categories';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get category by ID or slug
export const getCategoryById = createAsyncThunk(
  'services/getCategoryById',
  async (identifier, thunkAPI) => {
    try {
      const response = await api.get(`/services/categories/${identifier}`);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch category';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get subservices by category
export const getSubServicesByCategory = createAsyncThunk(
  'services/getSubServicesByCategory',
  async ({ categoryId, params = {} }, thunkAPI) => {
    try {
      const { active, popular } = params;
      const queryParams = new URLSearchParams();

      if (active !== undefined) queryParams.append('active', active);
      if (popular !== undefined) queryParams.append('popular', popular);

      const response = await api.get(`/services/categories/${categoryId}/subservices?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch subservices';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get subservice by ID or slug
export const getSubServiceById = createAsyncThunk(
  'services/getSubServiceById',
  async (identifier, thunkAPI) => {
    try {
      const response = await api.get(`/services/subservices/${identifier}`);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch subservice';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ============ ADMIN ACTIONS ============

// Create category (admin)
export const createCategory = createAsyncThunk(
  'services/createCategory',
  async (categoryData, thunkAPI) => {
    try {
      const response = await api.post('/services/admin/categories', categoryData);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create category';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update category (admin)
export const updateCategory = createAsyncThunk(
  'services/updateCategory',
  async ({ id, categoryData }, thunkAPI) => {
    try {
      const response = await api.put(`/services/admin/categories/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update category';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete category (admin)
export const deleteCategory = createAsyncThunk(
  'services/deleteCategory',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/services/admin/categories/${id}`);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete category';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all subservices (admin)
export const getAllSubServices = createAsyncThunk(
  'services/getAllSubServices',
  async (params = {}, thunkAPI) => {
    try {
      const { categoryId, active, popular } = params;
      const queryParams = new URLSearchParams();

      if (categoryId) queryParams.append('categoryId', categoryId);
      if (active !== undefined) queryParams.append('active', active);
      if (popular !== undefined) queryParams.append('popular', popular);

      const response = await api.get(`/services/admin/subservices?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch subservices';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create subservice (admin)
export const createSubService = createAsyncThunk(
  'services/createSubService',
  async (subServiceData, thunkAPI) => {
    try {
      const response = await api.post('/services/admin/subservices', subServiceData);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create subservice';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update subservice (admin)
export const updateSubService = createAsyncThunk(
  'services/updateSubService',
  async ({ id, subServiceData }, thunkAPI) => {
    try {
      const response = await api.put(`/services/admin/subservices/${id}`, subServiceData);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update subservice';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete subservice (admin)
export const deleteSubService = createAsyncThunk(
  'services/deleteSubService',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/services/admin/subservices/${id}`);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete subservice';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  categories: [],
  selectedCategory: null,
  subServices: [],
  selectedSubService: null,
  isLoading: false,
  error: null,
  message: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearSelectedSubService: (state) => {
      state.selectedSubService = null;
    },
    clearSubServices: (state) => {
      state.subServices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get category by ID
      .addCase(getCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get subservices by category
      .addCase(getSubServicesByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubServicesByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subServices = action.payload;
      })
      .addCase(getSubServicesByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get subservice by ID
      .addCase(getSubServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSubService = action.payload;
      })
      .addCase(getSubServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create category (admin)
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.message = 'Category created successfully';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update category (admin)
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.message = 'Category updated successfully';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete category (admin)
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter((c) => c._id !== action.payload);
        state.message = 'Category deleted successfully';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all subservices (admin)
      .addCase(getAllSubServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllSubServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subServices = action.payload;
      })
      .addCase(getAllSubServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create subservice (admin)
      .addCase(createSubService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subServices.push(action.payload);
        state.message = 'Subservice created successfully';
      })
      .addCase(createSubService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update subservice (admin)
      .addCase(updateSubService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subServices.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.subServices[index] = action.payload;
        }
        state.message = 'Subservice updated successfully';
      })
      .addCase(updateSubService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete subservice (admin)
      .addCase(deleteSubService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subServices = state.subServices.filter((s) => s._id !== action.payload);
        state.message = 'Subservice deleted successfully';
      })
      .addCase(deleteSubService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearSelectedCategory,
  clearSelectedSubService,
  clearSubServices,
} = serviceSlice.actions;

export default serviceSlice.reducer;

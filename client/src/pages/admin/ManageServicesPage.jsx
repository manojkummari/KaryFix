import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategories,
  getAllSubServices,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubService,
  updateSubService,
  deleteSubService,
  clearMessage,
  clearError,
} from '../../store/slices/serviceSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { CategoryIcon } from '../../utils/categoryIcons';
import { FaEdit, FaTrash, FaPlus, FaLayerGroup, FaTags, FaCheck, FaTimes, FaStar, FaSearch } from 'react-icons/fa';

const ManageServicesPage = () => {
  const dispatch = useDispatch();
  const { categories, subServices, isLoading, error, message } = useSelector(
    (state) => state.services
  );

  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered data based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubServices = subServices.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    active: true,
    featured: false,
    displayOrder: 0,
  });

  const [subServiceForm, setSubServiceForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    priceMin: '',
    priceMax: '',
    priceType: 'range',
    durationValue: '',
    durationUnit: 'hours',
    features: [''],
    active: true,
    popular: false,
    displayOrder: 0,
  });

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getAllSubServices());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        dispatch(clearMessage());
        setShowModal(false);
        resetForms();
      }, 2000);
    }
  }, [message, dispatch]);

  const resetForms = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      image: '',
      active: true,
      featured: false,
      displayOrder: 0,
    });
    setSubServiceForm({
      categoryId: '',
      name: '',
      description: '',
      priceMin: '',
      priceMax: '',
      priceType: 'range',
      durationValue: '',
      durationUnit: 'hours',
      features: [''],
      active: true,
      popular: false,
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleCreateCategory = () => {
    setModalMode('create');
    setActiveTab('categories');
    resetForms();
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setModalMode('edit');
    setActiveTab('categories');
    setEditingItem(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon || '',
      image: category.image || '',
      active: category.active,
      featured: category.featured,
      displayOrder: category.displayOrder,
    });
    setShowModal(true);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  const handleCreateSubService = () => {
    setModalMode('create');
    setActiveTab('subservices');
    resetForms();
    setShowModal(true);
  };

  const handleEditSubService = (subService) => {
    setModalMode('edit');
    setActiveTab('subservices');
    setEditingItem(subService);
    setSubServiceForm({
      categoryId: subService.categoryId._id || subService.categoryId,
      name: subService.name,
      description: subService.description,
      priceMin: subService.priceRange.min,
      priceMax: subService.priceRange.max,
      priceType: subService.priceType,
      durationValue: subService.estimatedDuration?.value || '',
      durationUnit: subService.estimatedDuration?.unit || 'hours',
      features: subService.features.length > 0 ? subService.features : [''],
      active: subService.active,
      popular: subService.popular,
      displayOrder: subService.displayOrder,
    });
    setShowModal(true);
  };

  const handleDeleteSubService = (id) => {
    if (window.confirm('Are you sure you want to delete this subservice?')) {
      dispatch(deleteSubService(id));
    }
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      dispatch(createCategory(categoryForm));
    } else {
      dispatch(updateCategory({ id: editingItem._id, categoryData: categoryForm }));
    }
  };

  const handleSubmitSubService = (e) => {
    e.preventDefault();
    const data = {
      categoryId: subServiceForm.categoryId,
      name: subServiceForm.name,
      description: subServiceForm.description,
      priceRange: {
        min: parseFloat(subServiceForm.priceMin),
        max: parseFloat(subServiceForm.priceMax),
        unit: 'INR',
      },
      priceType: subServiceForm.priceType,
      estimatedDuration: {
        value: parseInt(subServiceForm.durationValue) || 0,
        unit: subServiceForm.durationUnit,
      },
      features: subServiceForm.features.filter((f) => f.trim() !== ''),
      active: subServiceForm.active,
      popular: subServiceForm.popular,
      displayOrder: subServiceForm.displayOrder,
    };

    if (modalMode === 'create') {
      dispatch(createSubService(data));
    } else {
      dispatch(updateSubService({ id: editingItem._id, subServiceData: data }));
    }
  };

  const addFeatureField = () => {
    setSubServiceForm({
      ...subServiceForm,
      features: [...subServiceForm.features, ''],
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...subServiceForm.features];
    newFeatures[index] = value;
    setSubServiceForm({ ...subServiceForm, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = subServiceForm.features.filter((_, i) => i !== index);
    setSubServiceForm({ ...subServiceForm, features: newFeatures });
  };

  return (
    <DashboardLayout title="Service Management" menuItems={getMenuItemsByRole('admin')}>
      {message && (
        <Alert variant="success" className="mb-6" onClose={() => dispatch(clearMessage())}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="bg-neutral-900/50 p-1 rounded-xl border border-neutral-700/50 backdrop-blur-sm flex">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'categories'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FaLayerGroup /> Categories ({filteredCategories.length})
          </button>
          <button
            onClick={() => setActiveTab('subservices')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'subservices'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FaTags /> Subservices ({filteredSubServices.length})
          </button>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-initial group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm"
            />
          </div>
          
          <button
            onClick={activeTab === 'categories' ? handleCreateCategory : handleCreateSubService}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-yellow-500/20"
          >
            <FaPlus /> Add {activeTab === 'categories' ? 'Category' : 'Subservice'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : (
        <>
          {/* Categories Grid */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="group bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <CategoryIcon slug={category.name} className="text-2xl text-yellow-500" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-neutral-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">
                      {category.name}
                    </h4>
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2 h-10">
                      {category.description}
                    </p>

                    <div className="flex gap-2">
                      {category.active ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                          <FaCheck className="text-[10px]" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-neutral-500/10 text-neutral-400 text-xs font-medium rounded-full border border-neutral-500/20">
                          <FaTimes className="text-[10px]" /> Inactive
                        </span>
                      )}
                      {category.featured && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20">
                          <FaStar className="text-[10px]" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subservices Grid */}
          {activeTab === 'subservices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubServices.map((subService) => (
                <div
                  key={subService._id}
                  className="group bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                      {subService.categoryId?.name || 'Uncategorized'}
                    </span>
                    <div className="flex gap-1" >
                        <button
                          onClick={() => handleEditSubService(subService)}
                          className="p-1.5 text-neutral-400 hover:text-yellow-500 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubService(subService._id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">{subService.name}</h4>
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2 h-10">
                    {subService.description}
                  </p>

                  <div className="flex justify-between items-end border-t border-neutral-700/30 pt-4 mt-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Price Range</p>
                      <p className="text-yellow-500 font-bold">
                        ₹{subService.priceRange.min} - ₹{subService.priceRange.max}
                      </p>
                    </div>
                    <div className="text-right">
                      {subService.popular && (
                         <span className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                           <FaStar /> Popular
                         </span>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Create' : 'Edit'}{' '}
                <span className="text-yellow-500">{activeTab === 'categories' ? 'Category' : 'Subservice'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'categories' ? (
                <form onSubmit={handleSubmitCategory} className="space-y-6">
                  <Input
                    label="Name *"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Description *"
                    multiline
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Icon URL (optional)"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="Icons are auto-generated from name"
                    />
                    <Input
                      label="Image URL"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-6 p-4 bg-neutral-800/50 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${categoryForm.active ? 'bg-green-500 border-green-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                        {categoryForm.active && <FaCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={categoryForm.active}
                        onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Active Status</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${categoryForm.featured ? 'bg-yellow-500 border-yellow-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                        {categoryForm.featured && <FaCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={categoryForm.featured}
                        onChange={(e) => setCategoryForm({ ...categoryForm, featured: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Featured</span>
                    </label>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitSubService} className="space-y-6">
                  <div>
                    <label className="block text-neutral-400 text-sm font-medium mb-2">Category *</label>
                    <select
                      value={subServiceForm.categoryId}
                      onChange={(e) => setSubServiceForm({ ...subServiceForm, categoryId: e.target.value })}
                      required
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Input
                    label="Service Name *"
                    value={subServiceForm.name}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, name: e.target.value })}
                    required
                  />
                  
                  <Input
                    label="Description *"
                    multiline
                    rows={3}
                    value={subServiceForm.description}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, description: e.target.value })}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min Price (₹) *"
                      type="number"
                      value={subServiceForm.priceMin}
                      onChange={(e) => setSubServiceForm({ ...subServiceForm, priceMin: e.target.value })}
                      required
                    />
                    <Input
                      label="Max Price (₹) *"
                      type="number"
                      value={subServiceForm.priceMax}
                      onChange={(e) => setSubServiceForm({ ...subServiceForm, priceMax: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Duration Value"
                      type="number"
                      value={subServiceForm.durationValue}
                      onChange={(e) => setSubServiceForm({ ...subServiceForm, durationValue: e.target.value })}
                    />
                    <div>
                      <label className="block text-neutral-400 text-sm font-medium mb-2">Unit</label>
                      <select
                        value={subServiceForm.durationUnit}
                        onChange={(e) => setSubServiceForm({ ...subServiceForm, durationUnit: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-sm font-medium mb-2">Features</label>
                    <div className="space-y-2">
                      {subServiceForm.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="e.g., thorough cleanup"
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-neutral-100 focus:border-yellow-500 focus:outline-none"
                          />
                          {subServiceForm.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-500 hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeatureField}
                        className="text-yellow-500 text-sm font-bold hover:underline"
                      >
                        + Add another feature
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-6 p-4 bg-neutral-800/50 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${subServiceForm.active ? 'bg-green-500 border-green-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                        {subServiceForm.active && <FaCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={subServiceForm.active}
                        onChange={(e) => setSubServiceForm({ ...subServiceForm, active: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${subServiceForm.popular ? 'bg-purple-500 border-purple-500' : 'border-neutral-600 group-hover:border-neutral-500'}`}>
                        {subServiceForm.popular && <FaCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={subServiceForm.popular}
                        onChange={(e) => setSubServiceForm({ ...subServiceForm, popular: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Popular Choice</span>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {modalMode === 'create' ? 'Create Subservice' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageServicesPage;

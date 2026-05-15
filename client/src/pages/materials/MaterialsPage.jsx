import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { getMaterials, addToCart, clearError, clearMessage } from '../../store/slices/materialsSlice';
import { FaShoppingCart, FaPlus, FaMinus, FaRupeeSign, FaFilter, FaSearch, FaBox } from 'react-icons/fa';

const CATEGORIES = [
  { id: 'all', name: 'All Materials' },
  { id: 'cement', name: 'Cement' },
  { id: 'steel', name: 'Steel' },
  { id: 'sand', name: 'Sand' },
  { id: 'bricks', name: 'Bricks' },
  { id: 'tiles', name: 'Tiles' },
  { id: 'paint', name: 'Paint' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'plumbing', name: 'Plumbing' },
];

const MaterialsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { materials, cart, isLoading, error, message } = useSelector((state) => state.materials);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});

  const menuItems = getMenuItemsByRole(user?.role || 'customer');

  useEffect(() => {
    const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
    dispatch(getMaterials(params));
  }, [dispatch, selectedCategory]);

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (materialId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [materialId]: Math.max(1, (prev[materialId] || 1) + change),
    }));
  };

  const handleAddToCart = (material) => {
    dispatch(addToCart({ material, quantity: quantities[material._id] || 1 }));
    setQuantities((prev) => ({ ...prev, [material._id]: 1 }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DashboardLayout title="Construction Materials" menuItems={menuItems}>
      {error && (
        <Alert variant="error" className="mb-6" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" className="mb-6" onClose={() => dispatch(clearMessage())}>
          {message}
        </Alert>
      )}

      {/* Header with Cart */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-neutral-400">
            Browse quality construction materials at competitive prices
          </p>
        </div>
        <button
          onClick={() => navigate('/materials/cart')}
          className="relative flex items-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
        >
          <FaShoppingCart className="text-xl" />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
          {cartTotal > 0 && (
            <span className="text-sm">₹{cartTotal}</span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-20">
          <FaBox className="text-6xl text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg">No materials found</p>
          <p className="text-neutral-500 text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material._id}
              className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group"
            >
              {/* Image */}
              <div className="h-40 bg-neutral-800 flex items-center justify-center">
                {material.image ? (
                  <img
                    src={material.image}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaBox className="text-4xl text-neutral-600" />
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors">
                    {material.name}
                  </h3>
                  {material.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-500 mb-3 uppercase">
                  {material.category} • {material.brand || 'Generic'}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1 text-2xl font-black text-yellow-500">
                    <FaRupeeSign className="text-lg" />
                    {material.price}
                    <span className="text-sm text-neutral-500 font-normal">/{material.unit}</span>
                  </div>
                  <span className={`text-xs ${material.stock > 10 ? 'text-green-500' : 'text-orange-500'}`}>
                    {material.stock > 10 ? 'In Stock' : `Only ${material.stock} left`}
                  </span>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-neutral-800 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(material._id, -1)}
                      className="p-2 text-neutral-400 hover:text-white"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-3 text-white font-medium">
                      {quantities[material._id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(material._id, 1)}
                      className="p-2 text-neutral-400 hover:text-white"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(material)}
                    className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MaterialsPage;

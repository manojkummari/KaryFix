import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../store/slices/serviceSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import CategoryCard from '../../components/services/CategoryCard';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaSearch, FaStar, FaThLarge } from 'react-icons/fa';

const ServicesPage = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector((state) => state.services);
  const { user } = useSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    dispatch(getCategories({ active: true }));
  }, [dispatch]);

  const menuItems = getMenuItemsByRole(user?.role || 'customer');

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'featured' && category.featured);
    return matchesSearch && matchesFilter;
  });

  const featuredCount = categories.filter((c) => c.featured).length;

  return (
    <DashboardLayout title="Services" menuItems={menuItems}>
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-yellow-500 text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FaThLarge className="text-xs" /> All ({categories.length})
          </button>
          <button
            onClick={() => setActiveFilter('featured')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === 'featured'
                ? 'bg-yellow-500 text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FaStar className="text-xs" /> Featured ({featuredCount})
          </button>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-neutral-700/50 bg-neutral-900/50">
          <FaSearch className="text-3xl text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">{searchQuery ? 'No services found' : 'No services available'}</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-yellow-500 text-sm mt-2">Clear search</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ServicesPage;


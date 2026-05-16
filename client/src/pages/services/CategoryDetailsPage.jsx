import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategoryById,
  getSubServicesByCategory,
  clearSelectedCategory,
  clearSubServices,
} from '../../store/slices/serviceSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import SubServiceCard from '../../components/services/SubServiceCard';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { CategoryIcon } from '../../utils/categoryIcons';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCategory, subServices, isLoading, error } = useSelector(
    (state) => state.services
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCategoryById(id));
    dispatch(getSubServicesByCategory({ categoryId: id, params: { active: true } }));

    return () => {
      dispatch(clearSelectedCategory());
      dispatch(clearSubServices());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate('/services');
  };

  const menuItems = getMenuItemsByRole(user?.role || 'customer');

  return (
    <DashboardLayout
      title={selectedCategory?.name || 'Service Category'}
      menuItems={menuItems}
    >
      <button 
        onClick={handleBack} 
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Services
      </button>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : selectedCategory ? (
        <>
          {/* Category Header */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <CategoryIcon slug={selectedCategory.slug || selectedCategory.name} className="text-3xl text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCategory.name}
                  </h2>
                  {selectedCategory.featured && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded-full border border-yellow-500/30">
                      <FaStar className="text-xs" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-neutral-400">{selectedCategory.description}</p>
              </div>
            </div>
          </div>

          {/* Subservices */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">
              Available Services ({subServices.length})
            </h3>

            {subServices.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-neutral-700/50 bg-neutral-900/50">
                <p className="text-neutral-400">
                  No services available in this category
                </p>
              </div>
            ) : (
              <>
                {/* Popular Services */}
                {subServices.some((s) => s.popular) && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <FaStar className="text-yellow-500" />
                      <h4 className="text-lg font-semibold text-white">Popular Services</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                      {subServices
                        .filter((s) => s.popular)
                        .map((subService) => (
                          <SubServiceCard
                            key={subService._id}
                            subService={subService}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* All Services */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    All Services
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {subServices.map((subService) => (
                      <SubServiceCard
                        key={subService._id}
                        subService={subService}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16 rounded-xl border border-neutral-700/50 bg-neutral-900/50">
          <p className="text-neutral-400">Category not found</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CategoryDetailsPage;


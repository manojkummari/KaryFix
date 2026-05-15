import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '../../utils/categoryIcons';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services/${category._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-neutral-800/60 backdrop-blur-xl border border-neutral-700/50 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-500/50 group"
    >
      {category.image && (
        <div className="mb-4 rounded-lg overflow-hidden h-40 bg-neutral-900">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-yellow-500 group-hover:text-yellow-400 transition-colors">
          {category.name}
        </h3>
        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
          <CategoryIcon slug={category.slug || category.name} className="text-xl text-yellow-500" />
        </div>
      </div>

      <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
        {category.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {category.subservices?.length || 0} services available
        </span>

        {category.featured && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full border border-yellow-500/30">
            Featured
          </span>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;


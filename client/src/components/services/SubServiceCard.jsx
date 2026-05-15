import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const SubServiceCard = ({ subService, onBook }) => {
  const navigate = useNavigate();

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBook) {
      onBook(subService);
    } else {
      navigate('/booking/create', { state: { subService } });
    }
  };

  const formatPrice = () => {
    if (subService.priceType === 'fixed') {
      return `₹${subService.priceRange.min}`;
    }
    return `₹${subService.priceRange.min} - ₹${subService.priceRange.max}`;
  };

  const getPriceLabel = () => {
    switch (subService.priceType) {
      case 'per-hour':
        return 'per hour';
      case 'per-item':
        return 'per item';
      case 'fixed':
        return 'fixed price';
      default:
        return '';
    }
  };

  return (
    <div className="bg-neutral-800/60 backdrop-blur-xl border border-neutral-700/50 rounded-lg p-5 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 hover:border-yellow-500/50 flex flex-col h-full">
      {subService.images && subService.images.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden h-32 bg-neutral-900">
          <img
            src={subService.images[0]}
            alt={subService.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-yellow-500 mb-1">
            {subService.name}
          </h4>
          {subService.popular && (
            <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30 mb-2">
              Popular
            </span>
          )}
        </div>
      </div>

      <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
        {subService.description}
      </p>

      {subService.features && subService.features.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-neutral-400 mb-2">Includes:</p>
          <ul className="space-y-1">
            {subService.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-xs text-neutral-300 flex items-center">
                <span className="text-yellow-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-neutral-700/50 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-yellow-500">{formatPrice()}</p>
            {getPriceLabel() && (
              <p className="text-xs text-neutral-400">{getPriceLabel()}</p>
            )}
          </div>
          {subService.estimatedDuration && (
            <div className="text-right">
              <p className="text-sm text-neutral-300">
                {subService.estimatedDuration.value} {subService.estimatedDuration.unit}
              </p>
              <p className="text-xs text-neutral-400">estimated</p>
            </div>
          )}
        </div>

        <Button onClick={handleBook} className="w-full">
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default SubServiceCard;

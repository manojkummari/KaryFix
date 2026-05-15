// Mapping of service category slugs/names to react-icons
import {
  FaMobileAlt,
  FaCar,
  FaCog,
  FaCut,
  FaTshirt,
  FaCouch,
  FaRecycle,
  FaUserGraduate,
  FaTools,
  FaPlug,
  FaMotorcycle,
  FaPaintBrush,
  FaWrench,
  FaLaptop,
  FaTv,
  FaWater,
  FaFan,
  FaHome,
  FaBroom,
  FaTruck,
} from 'react-icons/fa';

// Pattern-based icon mapping (uses partial matching)
const iconPatterns = [
  { pattern: /electronic|mobile|phone|tv|laptop|computer|gaming|smart/i, icon: FaMobileAlt },
  { pattern: /vehicle|car|bike|motor|auto|truck|lorry/i, icon: FaCar },
  { pattern: /motor.?rewinding|mechanical/i, icon: FaCog },
  { pattern: /tailor|stitch|alteration/i, icon: FaCut },
  { pattern: /laundry|dry.?clean|wash/i, icon: FaTshirt },
  { pattern: /interior|furniture|design/i, icon: FaCouch },
  { pattern: /waste|garbage|recycle/i, icon: FaRecycle },
  { pattern: /student|education|school|drop/i, icon: FaUserGraduate },
  { pattern: /plumb/i, icon: FaWater },
  { pattern: /electric/i, icon: FaPlug },
  { pattern: /paint/i, icon: FaPaintBrush },
  { pattern: /clean/i, icon: FaBroom },
  { pattern: /ac|air.?condition|cool/i, icon: FaFan },
  { pattern: /home/i, icon: FaHome },
  { pattern: /truck|lorry|transport/i, icon: FaTruck },
];

/**
 * Get the react-icon component for a service category
 * @param {string} categoryName - The category name or slug
 * @returns {Function} The icon component
 */
export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return FaTools;
  
  // Find matching pattern
  for (const { pattern, icon } of iconPatterns) {
    if (pattern.test(categoryName)) {
      return icon;
    }
  }
  
  // Default icon
  return FaTools;
};

/**
 * Render the icon component for a category
 * @param {Object} props - Component props
 * @param {string} props.slug - The category slug or name
 * @param {string} props.className - Optional CSS classes
 * @returns {JSX.Element} The rendered icon
 */
export const CategoryIcon = ({ slug, className = '' }) => {
  const IconComponent = getCategoryIcon(slug);
  return <IconComponent className={className} />;
};

export default getCategoryIcon;


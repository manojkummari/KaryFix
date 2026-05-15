export const ROLES = {
  CUSTOMER: 'customer',
  TECHNICIAN: 'technician',
  MANAGER: 'manager',
  WASTE_OFFICER: 'wasteOfficer',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.TECHNICIAN]: 'Technician',
  [ROLES.MANAGER]: 'Category Manager',
  [ROLES.WASTE_OFFICER]: 'Waste Management Officer',
  [ROLES.ADMIN]: 'Administrator',
};

export const ROLE_ROUTES = {
  [ROLES.CUSTOMER]: '/dashboard',
  [ROLES.TECHNICIAN]: '/technician/dashboard',
  [ROLES.MANAGER]: '/category-manager/dashboard',
  [ROLES.WASTE_OFFICER]: '/waste-officer/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};

export const SERVICE_CATEGORIES = [
  { value: 'electronics', label: 'Electronics Repair' },
  { value: 'vehicle', label: 'Vehicle Repair' },
  { value: 'motor-rewinding', label: 'Motor Rewinding' },
  { value: 'tailoring', label: 'Tailoring/Maggam Work' },
  { value: 'laundry', label: 'Laundry Service' },
  { value: 'interior', label: 'Interior/Construction' },
  { value: 'waste-collection', label: 'Waste Collection' },
  { value: 'student-drop', label: 'Student Drop Service' },
];

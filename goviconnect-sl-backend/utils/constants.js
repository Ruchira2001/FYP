const SL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

const CROP_CATEGORIES = [
  'vegetables', 'fruits', 'tea', 'paddy', 'spices',
];

const MEETING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const NOTIFICATION_TYPES = ['meeting', 'tip', 'guide', 'chat', 'system', 'diagnosis'];

const ORDER_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

module.exports = {
  SL_DISTRICTS,
  CROP_CATEGORIES,
  MEETING_STATUSES,
  NOTIFICATION_TYPES,
  ORDER_STATUSES,
  formatCurrency,
};

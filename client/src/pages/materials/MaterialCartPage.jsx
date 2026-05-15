import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createOrder,
  clearError,
  clearMessage,
  resetOrderSuccess,
} from '../../store/slices/materialsSlice';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaRupeeSign, FaArrowLeft, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const MaterialCartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cart, isLoading, error, message, orderSuccess } = useSelector((state) => state.materials);

  const [deliveryAddress, setDeliveryAddress] = useState({
    address: user?.address || '',
    coordinates: [0, 0],
  });
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const menuItems = getMenuItemsByRole(user?.role || 'customer');
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (materialId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(materialId));
    } else {
      dispatch(updateCartQuantity({ materialId, quantity: newQuantity }));
    }
  };

  const handlePlaceOrder = async () => {
    await dispatch(
      createOrder({
        items: cart.map((item) => ({
          materialId: item.materialId,
          quantity: item.quantity,
        })),
        deliveryAddress,
        paymentMethod,
        deliveryNotes,
      })
    );
  };

  const handleClose = () => {
    dispatch(resetOrderSuccess());
    navigate('/materials');
  };

  if (orderSuccess) {
    return (
      <DashboardLayout title="Order Placed" menuItems={menuItems}>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="text-5xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Order Placed Successfully!</h2>
          <p className="text-neutral-400 mb-8">
            {message || 'Your order has been received and is being processed. You will be notified when it is dispatched.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/materials/orders')}>
              View Orders
            </Button>
            <Button onClick={handleClose}>Continue Shopping</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Your Cart" menuItems={menuItems}>
      {error && (
        <Alert variant="error" className="mb-6" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/materials')}
        className="flex items-center gap-2 text-neutral-400 hover:text-yellow-500 mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Materials
      </button>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <FaShoppingCart className="text-6xl text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg">Your cart is empty</p>
          <Button onClick={() => navigate('/materials')} className="mt-6">
            Browse Materials
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{cart.length} Items</h3>
              <button
                onClick={() => dispatch(clearCart())}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            </div>

            {cart.map((item) => (
              <div
                key={item.materialId}
                className="flex gap-4 p-4 bg-neutral-900/50 border border-neutral-700/50 rounded-xl"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaShoppingCart className="text-neutral-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-sm text-neutral-500">₹{item.price}/{item.unit}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.materialId, item.quantity - 1)}
                    className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white"
                  >
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.materialId, item.quantity + 1)}
                    className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white"
                  >
                    <FaPlus />
                  </button>
                </div>

                {/* Price & Remove */}
                <div className="text-right">
                  <p className="font-bold text-yellow-500">₹{item.price * item.quantity}</p>
                  <button
                    onClick={() => dispatch(removeFromCart(item.materialId))}
                    className="text-sm text-red-400 hover:text-red-300 mt-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Delivery</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="border-t border-neutral-700 pt-3 flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-yellow-500">₹{cartTotal}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                  <FaMapMarkerAlt className="text-yellow-500" /> Delivery Address
                </label>
                <textarea
                  value={deliveryAddress.address}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                  placeholder="Enter your delivery address..."
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="text-neutral-400 text-sm mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cash', 'upi'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? 'bg-yellow-500 text-black'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading || !deliveryAddress.address}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? 'Placing Order...' : (
                  <>
                    <FaRupeeSign /> Place Order - ₹{cartTotal}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MaterialCartPage;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategories,
  getSubServicesByCategory,
  clearSubServices,
} from '../../store/slices/serviceSlice';
import { createBooking, clearMessage, clearError, verifyPayment } from '../../store/slices/bookingSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Alert from '../../components/common/Alert';
import LocationPicker from '../../components/common/LocationPicker';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaCheck, FaClipboardList, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaSpinner, FaRupeeSign, FaClock, FaExclamationTriangle, FaMoneyBillWave, FaCreditCard, FaMagic, FaRobot } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { categories, subServices, isLoading: servicesLoading } = useSelector(
    (state) => state.services
  );
  const { isLoading: bookingLoading, error, message } = useSelector(
    (state) => state.bookings
  );
  const { user } = useSelector((state) => state.auth);

  const preSelectedSubService = location.state?.subService;

  const [formData, setFormData] = useState({
    categoryId: preSelectedSubService?.categoryId?._id || '',
    subServiceId: preSelectedSubService?._id || '',
    description: '',
    address: '',
    coordinates: [0, 0],
    scheduledDate: '',
    photos: [],
    paymentMethod: 'cash',
  });

  const [photoURLs, setPhotoURLs] = useState(['']);
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    dispatch(getCategories({ active: true }));

    if (preSelectedSubService) {
      dispatch(
        getSubServicesByCategory({
          categoryId: preSelectedSubService.categoryId._id,
          params: { active: true },
        })
      );
    }
  }, [dispatch, preSelectedSubService]);

  useEffect(() => {
    if (message) {
      toast.success('Booking Created Successfully!');
      setTimeout(() => {
        navigate('/bookings/my-bookings');
        dispatch(clearMessage());
      }, 1500);
    }
  }, [message, navigate, dispatch]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      categoryId,
      subServiceId: '',
    });

    if (categoryId) {
      dispatch(getSubServicesByCategory({ categoryId, params: { active: true } }));
    } else {
      dispatch(clearSubServices());
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoURLChange = (index, value) => {
    const newPhotoURLs = [...photoURLs];
    newPhotoURLs[index] = value;
    setPhotoURLs(newPhotoURLs);

    const validURLs = newPhotoURLs.filter((url) => url.trim() !== '');
    setFormData({
      ...formData,
      photos: validURLs.map((url) => ({ url })),
    });
  };

  const addPhotoField = () => {
    if (photoURLs.length < 5) {
      setPhotoURLs([...photoURLs, '']);
    }
  };

  const removePhotoField = (index) => {
    const newPhotoURLs = photoURLs.filter((_, i) => i !== index);
    setPhotoURLs(newPhotoURLs.length > 0 ? newPhotoURLs : ['']);

    const validURLs = newPhotoURLs.filter((url) => url.trim() !== '');
    setFormData({
      ...formData,
      photos: validURLs.map((url) => ({ url })),
    });
  };

  const handleLocalAiAnalysis = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsAnalyzingLocal(true);
    const toastId = toast.loading('Analyzing image with Gemini AI...');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => (reader.onloadend = resolve));
      const base64Data = reader.result;

      let mimeType = 'image/jpeg';
      let dataStr = base64Data;
      if (base64Data.startsWith('data:')) {
        const parts = base64Data.split(';');
        mimeType = parts[0].split(':')[1];
        dataStr = parts[1].split(',')[1];
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyABs43BaRzA69IAVFie1aiuckOCt8kX_EM');
      
      let model;
      let result;
      const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-2.0-flash-exp'];
      const apiVersions = ['v1', 'v1beta'];
      let lastError = null;

      // Debug: Attempt to list models to see what this key can do
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyABs43BaRzA69IAVFie1aiuckOCt8kX_EM';
        fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
          .then(res => res.json())
          .then(data => console.log("DEBUG: Available models for this key:", data))
          .catch(err => console.error("DEBUG: Failed to list models:", err));
      } catch (e) {}

      const prompt = "You are a professional repair technician assistant. Analyze this image of a damaged product, device, or problem. Identify the object and the visible damage or issue. Provide a concise, clear, and professional problem description (under 3 sentences) that a technician can use to understand what needs to be fixed. Do not use conversational filler, just provide the description.";

      for (const modelName of modelsToTry) {
        for (const apiVersion of apiVersions) {
          try {
            console.log(`Trying Gemini model: ${modelName} (${apiVersion})...`);
            model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
            
            result = await model.generateContent([
              prompt,
              { inlineData: { data: dataStr, mimeType } }
            ]);
            
            // If we reached here, it worked!
            console.log(`Successfully used model: ${modelName} (${apiVersion})`);
            break;
          } catch (err) {
            console.warn(`Model ${modelName} (${apiVersion}) failed:`, err.message);
            lastError = err;
            continue; 
          }
        }
        if (result) break;
      }

      if (!result) {
        throw lastError || new Error('All Gemini models failed');
      }

      const text = await result.response.text();

      setFormData((prev) => ({
        ...prev,
        description: text.trim(),
      }));

      toast.success('Description autofilled!', { id: toastId });
    } catch (error) {
      console.error('Gemini AI Error:', error);
      const errorMessage = error.message || 'Unknown error';
      toast.error(`AI Analysis failed: ${errorMessage}`, { id: toastId });
    } finally {
      setIsAnalyzingLocal(false);
      // Reset input so the same file can be selected again
      e.target.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!formData.categoryId || !formData.subServiceId) {
      return;
    }

    // Validate scheduled date is not in the past
    if (formData.scheduledDate) {
      const scheduled = new Date(formData.scheduledDate);
      if (scheduled <= new Date()) {
        dispatch({ type: 'bookings/setError', payload: 'Scheduled date and time must be in the future.' });
        return;
      }
    }

    const bookingData = {
      categoryId: formData.categoryId,
      subServiceId: formData.subServiceId,
      description: formData.description,
      location: {
        address: formData.address,
        coordinates: formData.coordinates,
      },
      scheduledDate: formData.scheduledDate || null,
      photos: formData.photos,
      paymentMethod: formData.paymentMethod,
    };

    dispatch(createBooking(bookingData))
      .unwrap()
      .then((payload) => {
        if (formData.paymentMethod === 'online') {
           if (payload.razorpayOrder) {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SphwSJWJgkm37s',
              amount: payload.razorpayOrder.amount,
              currency: 'INR',
              name: 'KaryFix',
              description: 'Service Booking Payment',
              order_id: payload.razorpayOrder.id,
              handler: async function (response) {
                try {
                  await dispatch(verifyPayment({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    bookingId: payload.data._id
                  })).unwrap();
                } catch (err) {
                  toast.error('Payment verification failed');
                }
              },
              prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: user?.phone || ''
              },
              theme: {
                color: '#EAB308' // yellow-500
              }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
              toast.error(response.error.description);
            });
            rzp.open();
          } else {
            toast.error('Failed to initialize payment gateway. Please contact support.');
          }
        }
      })
      .catch((err) => {
        console.error('Booking failed:', err);
        toast.error(err || 'Failed to create booking');
      });
  };

  const selectedSubService = subServices.find((s) => s._id === formData.subServiceId);
  const selectedCategory = categories.find((c) => c._id === formData.categoryId);

  return (
    <DashboardLayout title="New Booking" menuItems={getMenuItemsByRole(user?.role)}>
      <div className="w-full relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Success State - Removed Full Screen Modal, using Toast instead */}

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <FaClipboardList className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Select Service</h3>
                <p className="text-neutral-500 text-sm">Choose a category and service</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  required
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Service</label>
                <select
                  name="subServiceId"
                  value={formData.subServiceId}
                  onChange={handleChange}
                  required
                  disabled={!formData.categoryId || servicesLoading}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{servicesLoading ? 'Loading...' : 'Select a service'}</option>
                  {subServices.map((subService) => (
                    <option key={subService._id} value={subService._id}>
                      {subService.name} - ₹{subService.priceRange.min}-{subService.priceRange.max}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Preview */}
              {selectedSubService && (
                <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 mt-4">
                  <p className="text-neutral-300 text-sm mb-3">{selectedSubService.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <FaRupeeSign className="text-xs" />
                      <span className="font-semibold">₹{selectedSubService.priceRange.min} - ₹{selectedSubService.priceRange.max}</span>
                    </div>
                    {selectedSubService.estimatedDuration && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <FaClock className="text-xs" />
                        <span>{selectedSubService.estimatedDuration.value} {selectedSubService.estimatedDuration.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Problem Description Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <FaClipboardList className="text-blue-500" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Describe the Issue
                  </h3>
                  <p className="text-neutral-500 text-sm">Help us understand your needs</p>
                </div>
                <label className="cursor-pointer group relative bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/20 transition-all shadow-md flex items-center justify-center">
                  <input type="file" className="hidden" accept="image/*" onChange={handleLocalAiAnalysis} disabled={isAnalyzingLocal} />
                  {isAnalyzingLocal ? (
                    <FaSpinner className="text-blue-400 animate-spin text-lg" />
                  ) : (
                    <FaRobot className="text-blue-400 text-xl hover:text-blue-300 transition-colors" />
                  )}
                  <span className="absolute -top-10 right-0 bg-neutral-800 text-xs text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-neutral-700 z-10 font-medium">
                    Upload Image for AI Analysis
                  </span>
                </label>
              </div>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe the problem or service you need..."
              className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
            />
          </div>

          {/* Location Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <FaMapMarkerAlt className="text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Service Location</h3>
                <p className="text-neutral-500 text-sm">Select your location on the map</p>
              </div>
            </div>
            <LocationPicker
              initialAddress={formData.address}
              onLocationSelect={(locationData) => {
                setFormData({
                  ...formData,
                  address: locationData.address,
                  coordinates: locationData.coordinates,
                });
              }}
            />
          </div>

          {/* Schedule Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FaCalendarAlt className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Preferred Date & Time</h3>
                <p className="text-neutral-500 text-sm">Optional - leave empty for ASAP</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate?.split('T')[0] || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const time = formData.scheduledDate?.split('T')[1] || '09:00';
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value ? `${e.target.value}T${time}` : '',
                    });
                  }}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Time</label>
                <input
                  type="time"
                  value={formData.scheduledDate?.split('T')[1] || ''}
                  onChange={(e) => {
                    const date = formData.scheduledDate?.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value ? `${date}T${e.target.value}` : formData.scheduledDate,
                    });
                  }}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            {formData.scheduledDate && (() => {
              const scheduled = new Date(formData.scheduledDate);
              const isPast = scheduled <= new Date();
              return (
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-sm flex items-center gap-2 ${isPast ? 'text-red-400' : 'text-neutral-400'}`}>
                    {isPast && <FaExclamationTriangle className="shrink-0" />}
                    Scheduled for:{' '}
                    <span className={isPast ? 'text-red-300' : 'text-white'}>
                      {scheduled.toLocaleString()}
                    </span>
                    {isPast && <span className="text-red-400 font-medium">— this time has already passed!</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, scheduledDate: '' })}
                    className="text-red-400 text-sm hover:text-red-300 ml-4 shrink-0"
                  >
                    Clear
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Photos Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <FaCamera className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Photos</h3>
                <p className="text-neutral-500 text-sm">Optional - add up to 5 image URLs</p>
              </div>
            </div>
            <div className="space-y-2">
              {photoURLs.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={url}
                    onChange={(e) => handlePhotoURLChange(index, e.target.value)}
                    className="flex-1 bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                  />
                  {photoURLs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhotoField(index)}
                      className="px-3 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {photoURLs.length < 5 && (
                <button
                  type="button"
                  onClick={addPhotoField}
                  className="w-full py-2 text-sm text-neutral-400 hover:text-yellow-500 border border-dashed border-neutral-700 rounded-xl hover:border-yellow-500/50 transition-all"
                >
                  + Add Photo URL
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <FaMoneyBillWave className="text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Payment Method</h3>
                <p className="text-neutral-500 text-sm">Select how you want to pay</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${formData.paymentMethod === 'cash'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="absolute opacity-0"
                />
                <div className="flex items-center gap-3 mb-1">
                  <FaMoneyBillWave className={formData.paymentMethod === 'cash' ? 'text-yellow-500' : 'text-neutral-400'} />
                  <span className={`font-semibold ${formData.paymentMethod === 'cash' ? 'text-white' : 'text-neutral-300'}`}>Cash on Service</span>
                </div>
                <p className="text-neutral-500 text-sm ml-7">Pay the technician after the job is done.</p>
              </label>

              <label
                className={`relative flex flex-col p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${formData.paymentMethod === 'online'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={formData.paymentMethod === 'online'}
                  onChange={handleChange}
                  className="absolute opacity-0"
                />
                <div className="flex items-center gap-3 mb-1">
                  <FaCreditCard className={formData.paymentMethod === 'online' ? 'text-yellow-500' : 'text-neutral-400'} />
                  <span className={`font-semibold ${formData.paymentMethod === 'online' ? 'text-white' : 'text-neutral-300'}`}>Online Payment</span>
                </div>
                <p className="text-neutral-500 text-sm ml-7">Pay securely via Razorpay (UPI, Card, Netbanking).</p>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={bookingLoading}
              className="flex-1 py-3 border border-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading || !formData.categoryId || !formData.subServiceId || !formData.description || !formData.address}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Creating...
                </>
              ) : (
                'Create Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBookingPage;


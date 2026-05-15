import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { createWastePickup, clearError, clearMessage } from '../../store/slices/wastePickupSlice';
import LocationPicker from '../../components/common/LocationPicker';
import { toast } from 'react-hot-toast';
import { FaRecycle, FaWeight, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaRupeeSign, FaArrowRight, FaLeaf, FaTrash, FaCheck } from 'react-icons/fa';

const MATERIAL_TYPES = [
  { id: 'plastic', name: 'Plastic', icon: '♻️', pricePerKg: 15, color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/30', activeBorder: 'border-blue-500' },
  { id: 'paper', name: 'Paper', icon: '📄', pricePerKg: 8, color: 'from-yellow-500/20 to-amber-500/20', borderColor: 'border-yellow-500/30', activeBorder: 'border-yellow-500' },
  { id: 'metal', name: 'Metal', icon: '🔧', pricePerKg: 25, color: 'from-gray-500/20 to-slate-500/20', borderColor: 'border-gray-500/30', activeBorder: 'border-gray-500' },
  { id: 'glass', name: 'Glass', icon: '🫙', pricePerKg: 5, color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-500/30', activeBorder: 'border-emerald-500' },
  { id: 'electronic', name: 'E-Waste', icon: '📱', pricePerKg: 40, color: 'from-purple-500/20 to-fuchsia-500/20', borderColor: 'border-purple-500/30', activeBorder: 'border-purple-500' },
  { id: 'organic', name: 'Organic', icon: '🌿', pricePerKg: 3, color: 'from-green-500/20 to-lime-500/20', borderColor: 'border-green-500/30', activeBorder: 'border-green-500' },
  { id: 'mixed', name: 'Mixed', icon: '🗑️', pricePerKg: 10, color: 'from-orange-500/20 to-red-500/20', borderColor: 'border-orange-500/30', activeBorder: 'border-orange-500' },
];

const WasteBookingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error, message } = useSelector((state) => state.wastePickup);

  // Scroll to top on error or message
  useEffect(() => {
    if (error || message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, message]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    materialType: '',
    weight: 5,
    location: {
      address: user?.address || '',
      coordinates: [0, 0],
    },
    scheduledDate: '',
    photos: [],
    notes: '',
  });

  const menuItems = getMenuItemsByRole(user?.role || 'customer');
  const selectedMaterial = MATERIAL_TYPES.find((m) => m.id === formData.materialType);
  const estimatedEarnings = selectedMaterial ? formData.weight * selectedMaterial.pricePerKg : 0;

  const handleMaterialSelect = (materialId) => {
    setFormData({ ...formData, materialType: materialId });
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    console.log('Form Data:', formData);
    try {
      const result = await dispatch(createWastePickup(formData)).unwrap();
      console.log('Submission Result:', result);
      toast.success('Waste pickup requested successfully!');
      navigate('/waste/my-pickups');
    } catch (err) {
      console.error('Submission Failed:', err);
      toast.error(err || 'Failed to submit request');
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <DashboardLayout title="Sell Your Waste" menuItems={menuItems}>
      <div className="max-w-6xl mx-auto">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert variant="success" className="mb-6" onClose={() => dispatch(clearMessage())}>
            {message}
            <Button onClick={() => navigate('/waste/my-pickups')} variant="outline" className="ml-4">
              View My Pickups
            </Button>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
            <div className="flex items-center relative z-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                   <div 
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-500 ${
                        step >= s 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/20 scale-110' 
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                   >
                     {step > s ? <FaCheck /> : s}
                     {step === s && <div className="absolute inset-0 rounded-full animate-ping bg-yellow-500/20" />}
                   </div>
                   {s < 3 && (
                     <div className="w-24 h-1 mx-2 rounded-full bg-neutral-800 overflow-hidden">
                       <div 
                          className={`h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500 ease-out`}
                          style={{ width: step > s ? '100%' : '0%' }}
                       />
                     </div>
                   )}
                </div>
              ))}
            </div>
        </div>

        {/* Step 1: Material Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">What are you selling today?</h2>
              <p className="text-neutral-400 text-lg">Select the type of waste material to get the best price</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {MATERIAL_TYPES.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleMaterialSelect(material.id)}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 text-center group overflow-hidden ${
                    formData.materialType === material.id
                      ? `${material.activeBorder} bg-gradient-to-br ${material.color} shadow-lg shadow-black/20 scale-105`
                      : 'border-neutral-700/50 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-600 hover:-translate-y-1'
                  }`}
                >
                  <div className="text-5xl mb-4 transform transition-transform group-hover:scale-110 duration-300">{material.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-1">{material.name}</h3>
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full inline-block mt-2 ${
                     formData.materialType === material.id 
                     ? 'bg-black/20 text-white' 
                     : 'bg-neutral-800 text-yellow-500'
                  }`}>
                    ₹{material.pricePerKg}/kg
                  </div>
                  
                  {formData.materialType === material.id && (
                    <div className="absolute top-3 right-3 text-white bg-green-500 rounded-full p-1 text-xs">
                        <FaCheck />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end max-w-4xl mx-auto">
              <Button
                onClick={nextStep}
                disabled={!formData.materialType}
                className="flex items-center gap-2 px-8 py-3 text-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black border-none shadow-lg shadow-yellow-500/20"
              >
                Next Step <FaArrowRight />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Weight & Details */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Quantity & Location</h2>
              <p className="text-neutral-400 text-lg">Tell us how much you have and where to pick it up</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
               {/* Left Column: Weight & Estimate */}
               <div className="space-y-6">
                  <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <label className="flex items-center gap-2 text-neutral-200 font-semibold text-lg">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><FaWeight /></div>
                        Est. Weight
                      </label>
                      <span className="text-2xl font-bold text-yellow-500">{formData.weight} kg</span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                      className="w-full h-3 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-yellow-500 mb-2"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>1 kg</span>
                      <span>50 kg</span>
                      <span>100 kg</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FaRupeeSign className="text-6xl text-yellow-500" />
                    </div>
                    <p className="text-neutral-300 font-medium mb-1">Estimated Earnings</p>
                    <div className="flex items-center justify-center gap-1 text-5xl font-black text-white px-4 py-2 my-2">
                       <span className="text-3xl text-yellow-500">₹</span>
                       {estimatedEarnings}
                    </div>
                    <div className="inline-block px-3 py-1 bg-black/30 rounded-full text-xs text-yellow-200 border border-yellow-500/20">
                      Based on ₹{selectedMaterial?.pricePerKg}/kg
                    </div>
                  </div>
                  
                   <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-6">
                    <label className="flex items-center gap-2 text-neutral-200 font-semibold mb-3">
                         <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><FaCalendarAlt /></div>
                         Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none transition-all"
                    />
                  </div>
               </div>

               {/* Right Column: Map */}
               <div className="lg:col-span-2">
                  <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-6 h-full flex flex-col">
                    <h3 className="flex items-center gap-2 text-neutral-200 font-semibold mb-4">
                       <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><FaMapMarkerAlt /></div>
                       Pickup Location
                    </h3>
                    <div className="flex-1 min-h-[350px] rounded-xl overflow-hidden border border-neutral-700/50 shadow-inner">
                      <LocationPicker
                        onLocationSelect={(location) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: {
                              address: location.address,
                              coordinates: location.coordinates,
                            },
                          }))
                        }
                        initialAddress={formData.location.address}
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={prevStep} className="px-6 py-2.5">
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formData.location.address}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black border-none shadow-lg shadow-yellow-500/20"
              >
                Review & Confirm <FaArrowRight />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Review Request</h2>
              <p className="text-neutral-400 text-lg">Double check the details before confirming</p>
            </div>

            <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-3xl p-8 mb-8 shadow-2xl shadow-black/50">
               {/* Summary Header */}
               <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-800">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedMaterial?.color} border ${selectedMaterial?.borderColor}`}>
                      <span className="text-4xl">{selectedMaterial?.icon}</span>
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold text-white">{selectedMaterial?.name} Waste</h3>
                      <p className="text-yellow-500 font-medium">Pickup Request</p>
                  </div>
                  <div className="ml-auto text-right">
                       <span className="block text-sm text-neutral-400">Total Value</span>
                       <span className="text-3xl font-bold text-white">₹{estimatedEarnings}</span>
                  </div>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
                     <span className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Weight</span>
                     <p className="text-xl font-medium text-white mt-1">{formData.weight} kg</p>
                  </div>
                  <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
                     <span className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Rate</span>
                     <p className="text-xl font-medium text-white mt-1">₹{selectedMaterial?.pricePerKg}/kg</p>
                  </div>
                  <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30 md:col-span-2">
                     <span className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Location</span>
                     <p className="text-lg font-medium text-white mt-1">{formData.location.address}</p>
                  </div>
                  {formData.scheduledDate && (
                     <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30 md:col-span-2">
                        <span className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Scheduled Date</span>
                         <p className="text-lg font-medium text-white mt-1">{new Date(formData.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     </div>
                  )}
               </div>

              {/* Notes */}
              <div className="mb-8">
                 <label className="flex items-center gap-2 text-neutral-300 font-medium mb-3">
                   <FaLeaf className="text-green-500" /> Additional Notes (Optional)
                 </label>
                 <textarea
                   value={formData.notes}
                   onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                   placeholder="Gate code, landmark, or specific instructions..."
                   rows={3}
                   className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none transition-all"
                 />
              </div>

               <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <Button variant="outline" onClick={prevStep} className="px-6 py-2.5">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                   className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black border-none shadow-lg shadow-yellow-500/20 font-bold"
                >
                  {isLoading ? (
                    'Processing...' 
                  ) : (
                    <>
                      Confirm Request <FaCheck />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WasteBookingPage;

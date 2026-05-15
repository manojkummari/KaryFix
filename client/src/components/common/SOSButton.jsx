import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerSOS, resetSOSState, clearMessage, clearError } from '../../store/slices/emergencySlice';
import { FaExclamationTriangle, FaTimes, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const SOSButton = () => {
  const dispatch = useDispatch();
  const { isLoading, sosTriggered, message, error } = useSelector((state) => state.emergency);
  const { user } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState({ address: user?.address || '', coordinates: [0, 0] });
  const [notes, setNotes] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    // Try to get current location
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            coordinates: [position.coords.longitude, position.coords.latitude],
          }));
          setGettingLocation(false);
        },
        () => {
          setGettingLocation(false);
        }
      );
    }
  };

  const handleTriggerSOS = async () => {
    await dispatch(
      triggerSOS({
        location,
        notes,
      })
    );
  };

  const handleClose = () => {
    setShowModal(false);
    setNotes('');
    dispatch(resetSOSState());
    dispatch(clearMessage());
    dispatch(clearError());
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
        title="Emergency SOS"
      >
        <FaExclamationTriangle className="text-2xl" />
      </button>

      {/* SOS Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <FaTimes />
              </button>
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <FaExclamationTriangle className="text-3xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Emergency SOS</h2>
              <p className="text-white/80 text-sm mt-1">
                Send an emergency alert to our team
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {sosTriggered ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <FaPhoneAlt className="text-3xl text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-green-500 mb-2">Help is on the way!</h3>
                  <p className="text-neutral-400">
                    {message || 'Our team has been notified and will contact you shortly.'}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Location */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                      <FaMapMarkerAlt className="text-red-500" /> Your Location
                    </label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      placeholder="Enter your current location"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                    />
                    {gettingLocation && (
                      <p className="text-xs text-neutral-500 mt-1">Getting GPS coordinates...</p>
                    )}
                    {location.coordinates[0] !== 0 && (
                      <p className="text-xs text-green-500 mt-1">✓ GPS location captured</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="text-neutral-400 text-sm mb-2 block">
                      What's the emergency? (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe your situation..."
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTriggerSOS}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        'Sending...'
                      ) : (
                        <>
                          <FaExclamationTriangle /> Send SOS
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;

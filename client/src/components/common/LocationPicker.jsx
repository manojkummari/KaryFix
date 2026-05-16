import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaSpinner, FaCrosshairs, FaSearch } from 'react-icons/fa';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker for selected location
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={selectedIcon} /> : null;
};

// Component to recenter map
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, initialAddress = '' }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default: Bangalore
  const mapRef = useRef(null);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setMapCenter(newPos);
        reverseGeocode(newPos);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        alert('Unable to get your location. Please select manually on the map.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (coords) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        onLocationSelect({
          address: data.display_name,
          coordinates: [coords[1], coords[0]], // [lng, lat] for MongoDB
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    setIsLoading(false);
  };

  // Search for address
  const searchAddress = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        setMapCenter(newPos);
        setAddress(data[0].display_name);
        onLocationSelect({
          address: data[0].display_name,
          coordinates: [newPos[1], newPos[0]], // [lng, lat] for MongoDB
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsLoading(false);
  };

  // Update location when position changes via map click
  useEffect(() => {
    if (position) {
      reverseGeocode(position);
    }
  }, [position]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search for an address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            onBlur={searchAddress}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
          />
        </div>
        <button
          type="button"
          onClick={searchAddress}
          disabled={isLoading}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {isLocating ? <FaSpinner className="animate-spin" /> : <FaCrosshairs />}
        </button>
      </div>

      {/* Map */}
      <div className="h-64 rounded-xl overflow-hidden border border-neutral-700">
        <MapContainer
          center={mapCenter}
          zoom={13}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          {position && <RecenterMap position={position} />}
        </MapContainer>
      </div>

      {/* Help Text */}
      <p className="text-neutral-500 text-xs text-center">
        Click on the map to select a location, or use the search bar / current location button
      </p>

      {/* Selected Address Display */}
      {address && position && (
        <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-neutral-300 text-sm">{address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

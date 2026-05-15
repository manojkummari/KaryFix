import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaUserCog, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom technician icon
const technicianIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Customer location icon
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when technician moves
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const MapTracker = ({
  technicianLocation,
  customerLocation,
  technicianName,
  technicianPhone,
  isLive = false,
  lastUpdated = null,
}) => {
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default: Bangalore
  const mapRef = useRef(null);

  useEffect(() => {
    if (technicianLocation && technicianLocation[0] !== 0) {
      setMapCenter([technicianLocation[1], technicianLocation[0]]); // [lat, lng]
    } else if (customerLocation && customerLocation[0] !== 0) {
      setMapCenter([customerLocation[1], customerLocation[0]]);
    }
  }, [technicianLocation, customerLocation]);

  const techPos = technicianLocation && technicianLocation[0] !== 0
    ? [technicianLocation[1], technicianLocation[0]]
    : null;
  const custPos = customerLocation && customerLocation[0] !== 0
    ? [customerLocation[1], customerLocation[0]]
    : null;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-neutral-700">
      {/* Status Badge */}
      {isLive && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 bg-green-500/90 text-white text-sm font-medium rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Live Tracking
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-neutral-900/80 text-neutral-300 text-xs rounded-full">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={15}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-recenter map */}
        <RecenterMap position={isLive && techPos ? techPos : custPos} />

        {/* Technician Marker */}
        {techPos && (
          <Marker position={techPos} icon={technicianIcon}>
            <Popup>
              <div className="text-center">
                <div className="flex items-center gap-2 font-bold text-neutral-800 mb-1">
                  <FaUserCog className="text-yellow-600" />
                  {technicianName || 'Technician'}
                </div>
                {technicianPhone && (
                  <a href={`tel:${technicianPhone}`} className="flex items-center gap-1 text-sm text-blue-600">
                    <FaPhone className="text-xs" /> {technicianPhone}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer Location Marker */}
        {custPos && (
          <Marker position={custPos} icon={customerIcon}>
            <Popup>
              <div className="flex items-center gap-2 font-bold text-neutral-800">
                <FaMapMarkerAlt className="text-blue-600" />
                Your Location
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* No location available */}
      {!techPos && !custPos && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 z-[1000]">
          <div className="text-center">
            <FaMapMarkerAlt className="text-4xl text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400">Location not available</p>
            <p className="text-neutral-500 text-sm">Waiting for technician to share location</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapTracker;

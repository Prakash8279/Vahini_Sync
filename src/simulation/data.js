/* ===== Vahini-Sync Simulation Data ===== */

// Delhi Ring Road inspired corridor — 5 junctions with realistic coordinates
export const JUNCTIONS = [
    { id: 'J1', name: 'Nehru Place Junction', lat: 28.5494, lng: 77.2530, normalGreen: 40, normalRed: 35 },
    { id: 'J2', name: 'Moolchand Flyover', lat: 28.5588, lng: 77.2430, normalGreen: 35, normalRed: 40 },
    { id: 'J3', name: 'AIIMS Crossing', lat: 28.5672, lng: 77.2318, normalGreen: 45, normalRed: 30 },
    { id: 'J4', name: 'Dhaula Kuan Junction', lat: 28.5751, lng: 77.2089, normalGreen: 40, normalRed: 35 },
    { id: 'J5', name: 'Pusa Road Junction', lat: 28.5836, lng: 77.1936, normalGreen: 35, normalRed: 40 },
];

export const HOSPITAL = {
    name: 'Safdarjung Hospital',
    lat: 28.5684,
    lng: 77.2101
};

export const AMBULANCE_DEPOT = {
    name: 'Central Dispatch',
    lat: 28.5440,
    lng: 77.2580
};

// Full route with interpolated points for smooth animation
export const ROUTE_POINTS = [
    { lat: 28.5440, lng: 77.2580 },
    { lat: 28.5460, lng: 77.2560 },
    { lat: 28.5480, lng: 77.2545 },
    { lat: 28.5494, lng: 77.2530 }, // J1
    { lat: 28.5515, lng: 77.2510 },
    { lat: 28.5535, lng: 77.2490 },
    { lat: 28.5555, lng: 77.2465 },
    { lat: 28.5570, lng: 77.2445 },
    { lat: 28.5588, lng: 77.2430 }, // J2
    { lat: 28.5610, lng: 77.2405 },
    { lat: 28.5630, lng: 77.2375 },
    { lat: 28.5650, lng: 77.2345 },
    { lat: 28.5672, lng: 77.2318 }, // J3
    { lat: 28.5690, lng: 77.2280 },
    { lat: 28.5710, lng: 77.2230 },
    { lat: 28.5730, lng: 77.2170 },
    { lat: 28.5751, lng: 77.2089 }, // J4
    { lat: 28.5770, lng: 77.2050 },
    { lat: 28.5790, lng: 77.2010 },
    { lat: 28.5810, lng: 77.1975 },
    { lat: 28.5836, lng: 77.1936 }, // J5
    { lat: 28.5750, lng: 77.2000 },
    { lat: 28.5700, lng: 77.2060 },
    { lat: 28.5684, lng: 77.2101 }, // Hospital
];

// Traffic density data (vehicles per 100m segment) — peak hour
export const TRAFFIC_DENSITY = {
    peak: [85, 92, 78, 95, 88, 72, 90, 83, 96, 70, 80, 85],
    offPeak: [30, 25, 35, 28, 32, 20, 38, 27, 33, 22, 30, 26],
};

// Historical congestion probability by hour
export const CONGESTION_HISTORY = [
    { hour: '6AM', level: 0.3 },
    { hour: '7AM', level: 0.5 },
    { hour: '8AM', level: 0.75 },
    { hour: '9AM', level: 0.85 },
    { hour: '10AM', level: 0.6 },
    { hour: '11AM', level: 0.45 },
    { hour: '12PM', level: 0.5 },
    { hour: '1PM', level: 0.55 },
    { hour: '2PM', level: 0.5 },
    { hour: '3PM', level: 0.55 },
    { hour: '4PM', level: 0.65 },
    { hour: '5PM', level: 0.8 },
    { hour: '6PM', level: 0.95 },
    { hour: '7PM', level: 0.85 },
    { hour: '8PM', level: 0.65 },
    { hour: '9PM', level: 0.4 },
    { hour: '10PM', level: 0.25 },
];

// AI decision log templates
export const AI_DECISIONS = [
    { junction: 'J1', action: 'Extended green by 25s', reason: 'Ambulance 500m away, queue length 12 vehicles', confidence: 94, timeSaved: 18 },
    { junction: 'J2', action: 'Pre-cleared intersection', reason: 'Predicted arrival in 45s, cross-traffic diverted', confidence: 91, timeSaved: 22 },
    { junction: 'J3', action: 'Triggered green wave', reason: 'High density corridor, RL model optimized timing', confidence: 97, timeSaved: 30 },
    { junction: 'J4', action: 'Side-road hold extended', reason: 'Low side-road queue (4 vehicles), minimal impact', confidence: 89, timeSaved: 15 },
    { junction: 'J5', action: 'Signal pre-empted to green', reason: 'Final approach to hospital, priority override', confidence: 96, timeSaved: 20 },
];

// Rerouting alerts for drivers
export const DRIVER_ALERTS = [
    { type: 'approaching', message: '🚑 Emergency vehicle approaching from behind. Prepare to yield.', distance: '800m' },
    { type: 'near', message: '🚑 Ambulance 200m behind you. Move to left lane NOW.', distance: '200m' },
    { type: 'reroute', message: 'Alternate route available via Lodhi Road. Saves 3 min.', distance: '500m' },
    { type: 'cleared', message: '✅ Emergency vehicle has passed. Resume normal driving.', distance: '0m' },
];

// Side road congestion impact data
export const SIDE_ROAD_IMPACT = [
    { junction: 'J1', road: 'Outer Ring Rd', normalWait: 45, emergencyWait: 68, additionalDelay: 23, queueLength: 18 },
    { junction: 'J2', road: 'Mathura Road', normalWait: 38, emergencyWait: 52, additionalDelay: 14, queueLength: 11 },
    { junction: 'J3', road: 'Sri Aurobindo', normalWait: 50, emergencyWait: 65, additionalDelay: 15, queueLength: 14 },
    { junction: 'J4', road: 'NH-48 Spur', normalWait: 42, emergencyWait: 58, additionalDelay: 16, queueLength: 12 },
    { junction: 'J5', road: 'Patel Road', normalWait: 35, emergencyWait: 48, additionalDelay: 13, queueLength: 9 },
];

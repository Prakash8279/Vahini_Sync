/* ===== Vahini-Sync Simulation Engine ===== */
import { JUNCTIONS, ROUTE_POINTS, AI_DECISIONS, HOSPITAL } from './data.js';

class SimulationEngine {
    constructor() {
        this.isRunning = false;
        this.emergencyActive = false;
        this.currentRouteIndex = 0;
        this.speed = 1; // multiplier
        this.tickInterval = null;
        this.elapsedSeconds = 0;
        this.totalTimeSaved = 0;
        this.junctionsCleared = 0;

        // Ambulance state
        this.ambulance = {
            lat: ROUTE_POINTS[0].lat,
            lng: ROUTE_POINTS[0].lng,
            speed: 0, // km/h
            heading: 0,
            etaSeconds: 0,
        };

        // Signal states: each junction has its own state machine
        this.signals = {};
        JUNCTIONS.forEach(j => {
            this.signals[j.id] = {
                mainState: 'red',       // 'green' | 'amber' | 'red'
                sideState: 'green',
                countdown: Math.floor(Math.random() * 30) + 10,
                overridden: false,
                greenWaveActive: false,
                cleared: false,
                timeSaved: 0,
            };
        });

        // Listeners
        this._listeners = {};
    }

    on(event, cb) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(cb);
    }

    off(event, cb) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(fn => fn !== cb);
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(cb => cb(data));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.elapsedSeconds = 0;
        this.totalTimeSaved = 0;
        this.junctionsCleared = 0;
        this.currentRouteIndex = 0;
        this.ambulance.lat = ROUTE_POINTS[0].lat;
        this.ambulance.lng = ROUTE_POINTS[0].lng;

        // Reset signals
        JUNCTIONS.forEach(j => {
            this.signals[j.id] = {
                mainState: 'red',
                sideState: 'green',
                countdown: Math.floor(Math.random() * 30) + 10,
                overridden: false,
                greenWaveActive: false,
                cleared: false,
                timeSaved: 0,
            };
        });

        this.tickInterval = setInterval(() => this.tick(), 1000 / this.speed);
        this.emit('start', {});
    }

    stop() {
        this.isRunning = false;
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = null;
        this.emit('stop', {});
    }

    reset() {
        this.stop();
        this.emergencyActive = false;
        this.currentRouteIndex = 0;
        this.elapsedSeconds = 0;
        this.totalTimeSaved = 0;
        this.junctionsCleared = 0;
        this.ambulance.lat = ROUTE_POINTS[0].lat;
        this.ambulance.lng = ROUTE_POINTS[0].lng;
        this.ambulance.speed = 0;
        this.ambulance.etaSeconds = 0;
        JUNCTIONS.forEach(j => {
            this.signals[j.id].overridden = false;
            this.signals[j.id].greenWaveActive = false;
            this.signals[j.id].cleared = false;
        });
        this.emit('reset', {});
    }

    setEmergency(active) {
        this.emergencyActive = active;
        this.emit('emergency', { active });
        if (active && !this.isRunning) {
            this.start();
        }
    }

    setSpeed(multiplier) {
        this.speed = multiplier;
        if (this.isRunning) {
            clearInterval(this.tickInterval);
            this.tickInterval = setInterval(() => this.tick(), 1000 / this.speed);
        }
    }

    tick() {
        if (!this.isRunning) return;
        this.elapsedSeconds++;

        // Move ambulance along route
        if (this.currentRouteIndex < ROUTE_POINTS.length - 1) {
            this.currentRouteIndex += 0.15; // movement speed
            if (this.currentRouteIndex >= ROUTE_POINTS.length - 1) {
                this.currentRouteIndex = ROUTE_POINTS.length - 1;
            }

            const idx = Math.floor(this.currentRouteIndex);
            const frac = this.currentRouteIndex - idx;
            const p1 = ROUTE_POINTS[idx];
            const p2 = ROUTE_POINTS[Math.min(idx + 1, ROUTE_POINTS.length - 1)];

            this.ambulance.lat = p1.lat + (p2.lat - p1.lat) * frac;
            this.ambulance.lng = p1.lng + (p2.lng - p1.lng) * frac;
            this.ambulance.speed = 35 + Math.random() * 15; // 35-50 km/h in emergency

            // Calculate ETA
            const remaining = ROUTE_POINTS.length - 1 - this.currentRouteIndex;
            this.ambulance.etaSeconds = Math.max(0, Math.round(remaining * 6.5));

            // Calculate heading
            const dlat = p2.lat - p1.lat;
            const dlng = p2.lng - p1.lng;
            this.ambulance.heading = Math.atan2(dlng, dlat) * (180 / Math.PI);
        } else {
            // Arrived at hospital
            this.ambulance.etaSeconds = 0;
            this.ambulance.speed = 0;
            this.emit('arrived', { totalTimeSaved: this.totalTimeSaved, elapsed: this.elapsedSeconds });
            this.stop();
            return;
        }

        // Update signal states
        this.updateSignals();

        // Emit tick
        this.emit('tick', {
            ambulance: { ...this.ambulance },
            signals: { ...this.signals },
            elapsed: this.elapsedSeconds,
            routeProgress: this.currentRouteIndex / (ROUTE_POINTS.length - 1),
            totalTimeSaved: this.totalTimeSaved,
            junctionsCleared: this.junctionsCleared,
        });
    }

    updateSignals() {
        JUNCTIONS.forEach((junction, idx) => {
            const sig = this.signals[junction.id];
            const dist = this.getDistance(this.ambulance, junction);

            if (this.emergencyActive) {
                // Green wave: 500m ahead
                if (dist < 0.005 && !sig.cleared) { // ~500m in degrees
                    if (!sig.greenWaveActive) {
                        sig.greenWaveActive = true;
                        sig.overridden = true;
                        sig.mainState = 'green';
                        sig.sideState = 'red';
                        sig.countdown = 60;
                        const decision = AI_DECISIONS[idx] || AI_DECISIONS[0];
                        sig.timeSaved = decision.timeSaved;
                        this.totalTimeSaved += decision.timeSaved;
                        this.emit('signalOverride', { junction, signal: sig, decision });
                    }
                }

                // Mark as cleared when ambulance passes
                if (dist < 0.001 && sig.greenWaveActive && !sig.cleared) {
                    sig.cleared = true;
                    this.junctionsCleared++;
                    this.emit('junctionCleared', { junction, junctionsCleared: this.junctionsCleared });
                }

                // Reset after ambulance passes (1km away)
                if (sig.cleared && dist > 0.008) {
                    sig.greenWaveActive = false;
                    sig.overridden = false;
                }
            }

            // Normal signal cycle
            if (!sig.overridden) {
                sig.countdown--;
                if (sig.countdown <= 0) {
                    if (sig.mainState === 'green') {
                        sig.mainState = 'amber';
                        sig.sideState = 'red';
                        sig.countdown = 5;
                    } else if (sig.mainState === 'amber') {
                        sig.mainState = 'red';
                        sig.sideState = 'green';
                        sig.countdown = junction.normalRed;
                    } else {
                        sig.mainState = 'green';
                        sig.sideState = 'red';
                        sig.countdown = junction.normalGreen;
                    }
                }
            } else {
                sig.countdown = Math.max(0, sig.countdown - 1);
            }
        });
    }

    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
    }

    getState() {
        return {
            isRunning: this.isRunning,
            emergencyActive: this.emergencyActive,
            ambulance: { ...this.ambulance },
            signals: { ...this.signals },
            elapsed: this.elapsedSeconds,
            routeProgress: this.currentRouteIndex / (ROUTE_POINTS.length - 1),
            totalTimeSaved: this.totalTimeSaved,
            junctionsCleared: this.junctionsCleared,
        };
    }

    // Get nearest junction info
    getNearestJunction() {
        let nearest = null;
        let minDist = Infinity;
        JUNCTIONS.forEach(j => {
            const d = this.getDistance(this.ambulance, j);
            if (d < minDist) {
                minDist = d;
                nearest = j;
            }
        });
        return { junction: nearest, distance: minDist };
    }
}

// Singleton
export const engine = new SimulationEngine();

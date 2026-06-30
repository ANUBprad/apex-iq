# API Reference

Base URL: `http://localhost:8000` (local) or your Railway URL.

All POST endpoints accept `Content-Type: application/json`.

---

## Health & Version

### `GET /health`
Returns service health status.

```json
{
  "status": "healthy",
  "version": "4.5.0",
  "build": "2025-Q2",
  "timestamp": "2025-06-20T12:00:00Z"
}
```

### `GET /version`
Returns build version and metadata.

```json
{
  "version": "4.5.0",
  "build": "2025-Q2",
  "name": "APEXiq Strategy OS",
  "description": "Real-time F1 strategy intelligence engine",
  "python_version": "3.12.4"
}
```

---

## Strategy

### `POST /strategy`
Primary strategy recommendation.

**Request Body:**
```json
{
  "compound": "SOFT",
  "tyre_age": 12,
  "circuit": "Monaco",
  "gap_ahead": 3.4,
  "gap_behind": 18.2,
  "fuel_load": 60,
  "track_temp": 35,
  "air_temp": 28,
  "laps_remaining": 30,
  "weather": "Dry",
  "safety_car_prob": 35,
  "rain_prob": 15
}
```

**Response:** Strategy recommendation with action, confidence, reasoning, fuel/traffic analysis, and pit window.

---

### `POST /simulate`
Run simulation comparison (stay out vs. pit).

**Response:**
```json
{
  "stay_out_loss": 4.2,
  "pit_loss": 22.5,
  "undercut_gain": 1.8,
  "undercut_possible": true
}
```

### `POST /strategy-comparison`
Compare multiple compound strategies.

**Response:** Recommended strategy with expected advantage, confidence, risk breakdown, and per-compound strategy data.

---

## Analysis

### `POST /monte-carlo`
Monte Carlo outcome distribution (10,000 iterations).

**Response:**
```json
{
  "win_probability": 15.3,
  "podium_probability": 42.1,
  "average_finish": 5.8,
  "best_case": 1,
  "worst_case": 18,
  "simulations": 1000
}
```

### `POST /race-outcome`
Projected finish position and championship impact.

### `POST /safety-car-analysis`
Safety car impact on pit strategy.

### `POST /rain-strategy`
Rain crossover lap and compound recommendation.

---

## Telemetry & Replay

### `GET /replay-intelligence/{lap}/{total_laps}`
Lap-by-lap telemetry insight.

### `GET /historical/{circuit}`
Historical race data for a given circuit.

### `GET /pit-accuracy/{circuit}/{lap}`
Pit window accuracy analysis.

---

## Dashboard (V2 API)

### `POST /api/v2/dashboard/aggregate`
Full mission control dashboard aggregation.

**Request Body:**
```json
{
  "circuit_id": "Monaco",
  "driver_id": "max-verstappen",
  "compound": "MEDIUM",
  "tyre_age": 12,
  "laps_remaining": 30,
  "current_position": 5,
  "iterations": 1000
}
```

**Response:** Full aggregated dashboard state including strategy, simulation, history, memory, ML predictions, and explainability factors.

### `POST /api/v2/simulations/run`
Run a simulation scenario through the V2 engine.

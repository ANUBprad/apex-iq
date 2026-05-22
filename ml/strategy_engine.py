import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import joblib
import pandas as pd


class StrategyEngine:
    def __init__(self):

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        model_path = os.path.join(BASE_DIR, "ml", "models", "tyre_model.pkl")
        circuits_path = os.path.join(BASE_DIR, "data", "circuits.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at: {model_path}")

        if not os.path.exists(circuits_path):
            raise FileNotFoundError(f"Circuits database not found at: {circuits_path}")

        self.tyre_model = joblib.load(model_path)

        with open(circuits_path, "r") as f:
            self.circuit_data = json.load(f)


    # CIRCUIT DATABASE
    def get_circuit_data(self, circuit):

        return self.circuit_data.get(
            circuit, {"pit_loss": 20, "degradation_factor": 1.0, "overtaking_difficulty": 5, "safety_car_probability": 0.30}
        )

    def get_pit_loss(self, circuit):
        return self.get_circuit_data(circuit)["pit_loss"]

    def get_degradation_factor(self, circuit):
        return self.get_circuit_data(circuit)["degradation_factor"]

    def get_overtaking_difficulty(self, circuit):
        return self.get_circuit_data(circuit)["overtaking_difficulty"]

    def get_safety_car_probability(self, circuit):
        return self.get_circuit_data(circuit)["safety_car_probability"]


    def analyze_fuel(self, fuel_load, fuel_burn_rate, laps_remaining):
        fuel_needed = (fuel_burn_rate * laps_remaining)
        fuel_delta = (fuel_load - fuel_needed)

        if fuel_delta > 3:
            fuel_status = "PUSH MODE AVAILABLE"

        elif fuel_delta < 0:
            fuel_status = "FUEL SAVING REQUIRED"

        else:
            fuel_status = "NEUTRAL"

        return {
            "fuel_needed": round(float(fuel_needed), 2),
            "fuel_delta": round(float(fuel_delta), 2),
            "fuel_status": fuel_status
        }
    

    def predict_traffic(self, gap_ahead, gap_behind, pit_loss):

        if gap_behind > pit_loss + 5:
            traffic_status = "CLEAN AIR"
            traffic_risk = "LOW"

        elif gap_behind > pit_loss:
            traffic_status = "LIGHT TRAFFIC"
            traffic_risk = "MEDIUM"

        else:
            traffic_status = "HEAVY TRAFFIC"
            traffic_risk = "HIGH"

        return {"traffic_status": traffic_status, "traffic_risk": traffic_risk}
    

    def optimize_pit_window(self, compound, tyre_age, circuit, gap_ahead, gap_behind, current_lap=20, search_window=10):
        best_lap = current_lap
        best_score = float("inf")

        window_results = []

        for future_lap in range(current_lap, current_lap + search_window):

            future_tyre_age = (tyre_age + (future_lap - current_lap))

            stay_loss = self.simulate_stay_out(compound, future_tyre_age, circuit)
            pit_loss = self.simulate_pit(circuit)

            traffic_info = self.predict_traffic(gap_ahead, gap_behind, pit_loss)
            traffic_penalty = 0

            if traffic_info["traffic_risk"] == "HIGH":
                traffic_penalty = 5

            elif traffic_info["traffic_risk"] == "MEDIUM":
                traffic_penalty = 2

            total_score = (stay_loss + pit_loss + traffic_penalty)

            window_results.append({"lap": future_lap, "score": round(total_score, 2)})

            if total_score < best_score:
                best_score = total_score
                best_lap = future_lap

        return {
            "best_lap": best_lap,
            "best_score": round(float(best_score), 2), "window_results": window_results
        }


    # TYRE DEGRADATION MODEL
    def predict_degradation(self, compound, tyre_age, circuit="Bahrain", lap_number=10, track_temp=35, air_temp=25):

        compound_map = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}
        degradation_factor = self.get_degradation_factor(circuit)

        X = pd.DataFrame([{
            "compound_encoded": compound_map.get(compound, 1),
            "tyre_age": tyre_age,
            "lap_number": lap_number,
            "track_temp": track_temp,
            "air_temp": air_temp
        }])

        base_prediction = float(self.tyre_model.predict(X)[0])
        return base_prediction * degradation_factor


    # STRATEGY SIMULATIONS
    def simulate_stay_out(self, compound, tyre_age, circuit, laps_to_sim=5):
        total_loss = 0

        for i in range(laps_to_sim):
            loss = self.predict_degradation(compound, tyre_age + i, circuit)
            total_loss += loss
        return total_loss

    def simulate_pit(self, circuit, new_compound="MEDIUM", laps_to_sim=5):
        pit_loss = self.get_pit_loss(circuit)
        total_loss = pit_loss

        for i in range(laps_to_sim):
            loss = self.predict_degradation(new_compound, i, circuit)
            total_loss += loss
        return total_loss

    def simulate_undercut(self, compound, tyre_age, circuit, gap_ahead, opponent_pit_lap=2):
        gain = 0

        for i in range(opponent_pit_lap):
            your_lap = self.predict_degradation("MEDIUM", i, circuit)
            opponent_lap = self.predict_degradation(compound, tyre_age + i, circuit)
            gain += (opponent_lap - your_lap)

        return gain > gap_ahead, gain

    def simulate_strategy_options(self, compound, tyre_age, circuit, gap_ahead, track_temp=35, air_temp=25, rain_probability=0, weather="Dry", gap_behind=None):

        stay_loss = self.simulate_stay_out(compound, tyre_age, circuit)
        pit_loss = self.simulate_pit(circuit)
        undercut_gain = 0

        for i in range(2):
            your_lap = self.predict_degradation("MEDIUM", i, circuit)
            opponent_lap = self.predict_degradation(compound, tyre_age + i, circuit, track_temp=track_temp, air_temp=air_temp)
            undercut_gain += (opponent_lap - your_lap)

        return {
            "stay_out_loss": round(float(stay_loss), 2),
            "pit_loss": round(float(pit_loss), 2),
            "undercut_gain": round(float(undercut_gain), 2), "gap_ahead": gap_ahead
        }


    # DECISION ENGINE
    def decide(
        self, compound, tyre_age, circuit="Bahrain",
        gap_ahead=5, gap_behind=25,
        track_temp=35, air_temp=25, rain_probability=0, weather="Dry",
        fuel_load=100, fuel_burn_rate=1.8, laps_remaining=20
        ):

        stay_loss = self.simulate_stay_out(compound, tyre_age, circuit)
        pit_loss = self.simulate_pit(circuit)
        traffic_info = self.predict_traffic(gap_ahead, gap_behind, pit_loss)
        pit_window = self.optimize_pit_window(compound, tyre_age, circuit, gap_ahead, gap_behind)
        can_undercut, undercut_gain = self.simulate_undercut(compound, tyre_age, circuit, gap_ahead)
        safety_car_probability = self.get_safety_car_probability(circuit)
        overtake_difficulty = self.get_overtaking_difficulty(circuit)
        will_lose_position = (pit_loss > (gap_behind + 3))

        # WEATHER ANALYSIS
        weather_risk = 0
        fuel_info = self.analyze_fuel(fuel_load, fuel_burn_rate, laps_remaining)

        if weather == "Light Rain":
            weather_risk += 0.15

        elif weather == "Heavy Rain":
            weather_risk += 0.30

        if track_temp > 45:
            weather_risk += 0.10

        elif track_temp < 20:
            weather_risk += 0.05

        if rain_probability > 60:
            weather_risk += 0.20


        # DECISION LOGIC
        if can_undercut:
            decision = "PIT NOW (UNDERCUT)"

        elif pit_loss + 2 < stay_loss:
            decision = "PIT NOW"

        elif will_lose_position:
            decision = "DELAY PIT"

        else:
            decision = "STAY OUT"

        # Confidence        
        confidence = 0.50
        confidence += min(undercut_gain / 20, 0.25)

        if can_undercut:
            confidence += 0.10

        if will_lose_position:
            confidence -= 0.20

        # Weather uncertainty reduces confidence
        confidence -= weather_risk
        
        if traffic_info["traffic_risk"] == "HIGH":
            confidence -= 0.15

        elif traffic_info["traffic_risk"] == "MEDIUM":
            confidence -= 0.05

        if fuel_info["fuel_delta"] < 0:
            confidence -= 0.10

        elif fuel_info["fuel_delta"] > 5:
            confidence += 0.05

        confidence = max(0.20, confidence)
        confidence = min(0.95, confidence)


        # REASONING
        reasoning = (
            f"Stay loss: {stay_loss:.2f}s vs "
            f"Pit loss: {pit_loss:.2f}s. "
            f"Undercut gain: {undercut_gain:.2f}s. "
            f"Weather: {weather}. "
            f"Track Temp: {track_temp}°C. "
            f"Air Temp: {air_temp}°C. "
            f"Rain Probability: {rain_probability}%. "
            f"Fuel Delta: {fuel_info['fuel_delta']}kg. "
            f"Fuel Status: {fuel_info['fuel_status']}. "
            f"Safety Car Probability: "
            f"{safety_car_probability * 100:.0f}%. "
            f"Overtake Difficulty: "
            f"{overtake_difficulty}/10."
            f"Traffic Status: "
            f"{traffic_info['traffic_status']}. "
            f"Traffic Risk: "
            f"{traffic_info['traffic_risk']}. "
            f"Optimal Pit Lap: "
            f"{pit_window['best_lap']}. "
        )

        return {
            "action": decision,
            "confidence": round(float(confidence), 2),
            "reasoning": reasoning,
            "fuel_delta": fuel_info["fuel_delta"],
            "fuel_needed": fuel_info["fuel_needed"],
            "fuel_status": fuel_info["fuel_status"],
            "traffic_status": traffic_info["traffic_status"],
            "traffic_risk": traffic_info["traffic_risk"],
            "optimal_pit_lap":pit_window["best_lap"],
            "pit_window_score": pit_window["best_score"],
            "pit_window_analysis": pit_window["window_results"],
        }


# TEST
if __name__ == "__main__":

    engine = StrategyEngine()
    result = engine.decide(
        compound="MEDIUM",
        tyre_age=12,
        circuit="Monaco",
        gap_ahead=5,
        gap_behind=25
    )

    print("\nStrategy Decision")
    print("Action:", result["action"])
    print("Confidence:", result["confidence"])
    print("Reasoning:", result["reasoning"])
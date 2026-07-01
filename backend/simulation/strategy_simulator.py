class StrategySimulator:

    def __init__(self, strategy_engine):
        self.engine = strategy_engine

    def get_strategy_modifiers(self, circuit, weather, traffic_status):
        modifiers = {"undercut": 0, "overcut": 0}
        circuit_data = self.engine.get_circuit_data(circuit)
        overtake_difficulty = circuit_data["overtaking_difficulty"]

        if overtake_difficulty >= 8:
            modifiers["undercut"] += 4
        elif overtake_difficulty <= 4:
            modifiers["overcut"] += 2

        if weather == "Light Rain":
            modifiers["undercut"] -= 1
        elif weather == "Heavy Rain":
            modifiers["undercut"] -= 3
            modifiers["overcut"] -= 2

        if traffic_status == "HEAVY TRAFFIC":
            modifiers["undercut"] -= 3
        elif traffic_status == "CLEAN AIR":
            modifiers["undercut"] += 2

        return modifiers

    def estimate_race_time(self, compound, tyre_age, circuit, pit_stops, laps_remaining):
        degradation = self.engine.simulate_stay_out(compound, tyre_age, circuit, laps_remaining)
        pit_loss = (self.engine.get_pit_loss(circuit) * pit_stops)
        total_time = degradation + pit_loss
        return round(float(total_time), 2)

    def simulate_one_stop(self, compound, tyre_age, circuit, laps_remaining):
        race_time = self.estimate_race_time(compound, tyre_age, circuit, pit_stops=1, laps_remaining=laps_remaining)
        return {"name": "ONE_STOP", "pit_stops": 1, "race_time": race_time, "risk": "LOW"}

    def simulate_two_stop(self, compound, tyre_age, circuit, laps_remaining):
        two_stop_time = self.estimate_race_time(compound, tyre_age, circuit, pit_stops=2, laps_remaining=laps_remaining)
        tyre_advantage = 8
        race_time = two_stop_time - tyre_advantage
        return {"name": "TWO_STOP", "pit_stops": 2, "race_time": round(float(race_time), 2), "risk": "MEDIUM"}

    def simulate_undercut(self, compound, tyre_age, circuit, laps_remaining, weather, traffic_status):
        base_time = self.estimate_race_time(compound, tyre_age, circuit, pit_stops=1, laps_remaining=laps_remaining)
        modifiers = self.get_strategy_modifiers(circuit, weather, traffic_status)
        race_time = (base_time - 5 - modifiers["undercut"])
        return {"name": "UNDERCUT", "pit_stops": 1, "race_time": round(float(race_time), 2), "risk": "HIGH"}

    def simulate_overcut(self, compound, tyre_age, circuit, laps_remaining, weather, traffic_status):
        base_time = self.estimate_race_time(compound, tyre_age, circuit, pit_stops=1, laps_remaining=laps_remaining)
        modifiers = self.get_strategy_modifiers(circuit, weather, traffic_status)
        race_time = (base_time - 2 - modifiers["overcut"])
        return {"name": "OVERCUT", "pit_stops": 1, "race_time": round(float(race_time), 2), "risk": "MEDIUM"}

    def rank_strategies(self, strategies, risk_profile, compound_strategies):
        ordered = sorted(strategies, key=lambda x: x["race_time"])
        insight = self.build_strategy_insight(ordered)
        best_compound = min(compound_strategies, key=lambda x: x["race_time"])

        return {
            "recommended": ordered[0]["name"],
            "strategies": ordered,
            "recommended_compound_strategy": best_compound,
            "compound_strategies": sorted(compound_strategies, key=lambda x: x["race_time"]),
            "expected_advantage": insight["expected_advantage"],
            "strategy_confidence": insight["confidence"],
            "risk_score": risk_profile["risk_score"],
            "strategy_risk": risk_profile["strategy_risk"],
            "traffic_risk": risk_profile["traffic_risk"],
            "weather_risk": risk_profile["weather_risk"],
            "fuel_risk": risk_profile["fuel_risk"],
        }

    def build_strategy_insight(self, ranked):
        best = ranked[0]
        second = ranked[1]
        advantage = round(second["race_time"] - best["race_time"], 2)
        confidence = min(95, int(60 + advantage * 4))
        return {"expected_advantage": advantage, "confidence": confidence}

    def calculate_risk_profile(self, weather, traffic_status, fuel_delta):
        traffic_risk = 0
        weather_risk = 0
        fuel_risk = 0

        if traffic_status == "HEAVY TRAFFIC":
            traffic_risk = 60
        elif traffic_status == "LIGHT TRAFFIC":
            traffic_risk = 30

        if weather == "Light Rain":
            weather_risk = 15
        elif weather == "Heavy Rain":
            weather_risk = 35

        if fuel_delta < 0:
            fuel_risk = 25
        elif fuel_delta < 5:
            fuel_risk = 10

        total_risk = (traffic_risk + weather_risk + fuel_risk)
        total_risk = min(total_risk, 100)

        if total_risk >= 70:
            strategy_risk = "HIGH"
        elif total_risk >= 35:
            strategy_risk = "MEDIUM"
        else:
            strategy_risk = "LOW"

        return {
            "risk_score": total_risk,
            "strategy_risk": strategy_risk,
            "traffic_risk": traffic_risk,
            "weather_risk": weather_risk,
            "fuel_risk": fuel_risk,
        }

    def get_compound_modifier(self, compound):
        modifiers = {"SOFT": -6, "MEDIUM": -3, "HARD": 0, "INTERMEDIATE": -2, "WET": -1}
        return modifiers.get(compound, 0)

    def simulate_compound_strategy(self, compound_sequence, tyre_age, circuit, laps_remaining):
        total_time = 0
        for compound in compound_sequence:
            base_time = self.estimate_race_time(compound, tyre_age, circuit, pit_stops=0, laps_remaining=max(1, laps_remaining // len(compound_sequence)))
            total_time += (base_time + self.get_compound_modifier(compound))

        pit_stops = (len(compound_sequence) - 1)
        total_time += (self.engine.get_pit_loss(circuit) * pit_stops)
        return round(float(total_time), 2)

    def generate_compound_strategies(self, tyre_age, circuit, laps_remaining):
        strategies = [
            ["SOFT", "MEDIUM"],
            ["SOFT", "HARD"],
            ["MEDIUM", "HARD"],
            ["MEDIUM", "MEDIUM"],
            ["SOFT", "MEDIUM", "SOFT"],
        ]

        results = []
        for compounds in strategies:
            race_time = self.simulate_compound_strategy(compounds, tyre_age, circuit, laps_remaining)
            results.append({"strategy": " → ".join(compounds), "pit_stops": len(compounds) - 1, "race_time": race_time})

        return results

    def simulate_all(self, compound, tyre_age, circuit, laps_remaining, weather, traffic_status, fuel_delta):
        one_stop = self.simulate_one_stop(compound, tyre_age, circuit, laps_remaining)
        two_stop = self.simulate_two_stop(compound, tyre_age, circuit, laps_remaining)
        undercut = self.simulate_undercut(compound, tyre_age, circuit, laps_remaining, weather, traffic_status)
        overcut = self.simulate_overcut(compound, tyre_age, circuit, laps_remaining, weather, traffic_status)
        risk_profile = self.calculate_risk_profile(weather, traffic_status, fuel_delta)
        compound_strategies = self.generate_compound_strategies(tyre_age, circuit, laps_remaining)

        return self.rank_strategies([one_stop, two_stop, undercut, overcut], risk_profile, compound_strategies)

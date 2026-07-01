class RaceEngineer:

    def generate_briefing(self, strategy_result):
        action = strategy_result["action"]
        confidence = strategy_result["confidence"]
        fuel_status = strategy_result["fuel_status"]
        traffic_status = strategy_result["traffic_status"]
        reasoning_parts = []

        if traffic_status == "CLEAN AIR":
            reasoning_parts.append("Traffic projections indicate a clean-air rejoin after the stop.")
        elif traffic_status == "LIGHT TRAFFIC":
            reasoning_parts.append("Moderate traffic is expected after the stop.")
        else:
            reasoning_parts.append("Heavy traffic is expected after the stop and may compromise strategy execution.")

        if fuel_status == "PUSH MODE AVAILABLE":
            reasoning_parts.append("Fuel reserves allow aggressive push laps.")
        elif fuel_status == "FUEL SAVING REQUIRED":
            reasoning_parts.append("Fuel management will be required until the finish.")
        else:
            reasoning_parts.append("Fuel levels remain within the target operating window.")

        if "UNDERCUT" in action:
            reasoning_parts.append("Undercut potential is significant and favors an immediate stop.")
        elif action == "PIT NOW":
            reasoning_parts.append("Tyre degradation has reached the pit threshold.")
        elif action == "DELAY PIT":
            reasoning_parts.append("Track position risk suggests extending the stint.")
        else:
            reasoning_parts.append("Current pace remains competitive and stopping is not yet advantageous.")

        briefing = (
            "RACE ENGINEER BRIEFING\n\n"
            + "\n".join(reasoning_parts)
            + f"\n\nRecommended Action: {action}"
            + f"\nConfidence: {int(confidence * 100)}%"
        )

        return briefing

    def explain_strategy_ranking(self, strategy_result):
        recommended = strategy_result["recommended"]
        confidence = strategy_result["strategy_confidence"]
        advantage = strategy_result["expected_advantage"]
        risk = strategy_result["strategy_risk"]

        return (
            f"Strategy simulation completed. "
            f"{recommended} is projected to be the fastest approach. "
            f"Expected advantage: {advantage:.2f}s. "
            f"Confidence level: {confidence}%. "
            f"Overall strategy risk: {risk}."
        )

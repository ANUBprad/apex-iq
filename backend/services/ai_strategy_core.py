def compute_ai_strategy(strategy, comparison, driver, team, learning, safety_car, weather):
    score = 50
    reasons = []

    # DRIVER
    if driver:
        score += driver["racecraft"] * 0.08
        score += driver["consistency"] * 0.05
        reasons.append(f'Driver racecraft {driver["racecraft"]}')

    # TEAM
    if team:
        score += team["aggression"] * 0.05
        score += team["undercut_bias"] * 0.05
        reasons.append(f'Team aggression {team["aggression"]}')

    # LEARNING
    if learning:
        score += learning["success_rate"] * 0.10
        reasons.append(f'Historical success {learning["success_rate"]}%')

    # SAFETY CAR
    if safety_car:
        score += safety_car["pit_advantage"] * 0.5
        reasons.append(f'Safety car advantage {safety_car["pit_advantage"]}')

    # WEATHER
    if weather:
        score += weather * 0.20
        reasons.append(f'Rain probability {weather}%')
    score = max(0, min(100, round(score, 1)),
    )

    confidence = score
    if score >= 80:
        action = "EXECUTE IMMEDIATELY"
    elif score >= 65:
        action = "RECOMMENDED"
    elif score >= 50:
        action = "MONITOR"
    else:
        action = "HOLD"

    return {
        "action": action,
        "confidence": confidence,
        "reasons": reasons,
        "recommended_strategy": comparison["recommended"],
        "risk": comparison["strategy_risk"],
    }
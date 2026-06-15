def analyze_replay_lap(
    lap: int,
    total_laps: int,
):
    progress = lap / total_laps

    if progress < 0.3:
        recommendation = "BUILD TYRE LIFE"
        insight = "Tyre preservation phase."
        undercut = 25

    elif progress < 0.7:
        recommendation = "MONITOR PIT WINDOW"
        insight = "Optimal pit window approaching."
        undercut = 65

    else:
        recommendation = "PUSH TO FINISH"
        insight = "Race entering final stint."
        undercut = 40

    return {
        "lap": lap,
        "recommendation": recommendation,
        "insight": insight,
        "undercut_probability": undercut,
        "traffic_risk": "LOW"
        if undercut < 50
        else "MEDIUM",
    }
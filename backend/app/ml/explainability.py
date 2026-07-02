from typing import List, Dict, Any
import os
import json
from backend.app.ml.schemas import FeatureVector
from backend.app.ml.features import FeatureGenerator

class PredictionExplanationService:
    def __init__(self, prediction_service):
        self.prediction_service = prediction_service
        self.baselines = None
        self._load_baselines()

    def _load_baselines(self):
        """
        Loads baseline median values from the training dataset.
        If the training dataset is missing, falls back to a dictionary of predefined F1 baseline values.
        """
        dataset_path = "backend/app/ml/training_dataset.parquet"
        if os.path.exists(dataset_path):
            try:
                import pandas as pd
                df = pd.read_parquet(dataset_path)
                feature_names = FeatureGenerator.get_feature_names()
                # Exclude target columns if present
                features_only = [f for f in feature_names if f in df.columns]
                self.baselines = df[features_only].median().to_dict()
            except Exception as e:
                print(f"Warning: Failed to load training dataset for baselines: {e}")
                
        if not self.baselines:
            # Domain-specific fallback baselines (medians for a typical midfield scenario)
            self.baselines = {
                "current_position": 10,
                "laps_remaining": 25,
                "compound": 1, # MEDIUM
                "tyre_age": 10,
                "fuel_load": 50.0,
                "weather_factor": 1.0, # DRY
                "gap_ahead": 2.0,
                "gap_behind": 2.0,
                "aggression": 50.0,
                "consistency": 50.0,
                "racecraft": 50.0,
                "overtake_efficiency": 50.0,
                "tyre_management": 50.0,
                "wet_weather_skill": 50.0,
                "risk_tolerance": 50.0,
                "undercut_bias": 50.0,
                "tyre_focus": 50.0,
                "weather_adaptability": 50.0,
                "track_length": 5.0,
                "lap_count": 50,
                "pit_loss": 22.0
            }

    async def explain_prediction(self, vector: FeatureVector, target: str) -> Dict[str, Any]:
        """
        Provides local feature contribution analysis using Leave-One-Covariate-Out (LOCO) perturbation.
        
        LIMITATION DOCUMENTATION:
        Installing SHAP (SHapley Additive exPlanations) is not feasible in this target Windows 
        execution environment because SHAP has heavy C/C++ compilation dependencies (requiring MSVC 
        build tools) and python binary wheels are often missing or fail to compile locally. 
        As the mathematically closest valid alternative, we implement Leave-One-Covariate-Out (LOCO) 
        Perturbation Analysis. LOCO isolates the marginal contribution of each individual feature 
        by comparing the original prediction probability P(Y=1 | x) against P(Y=1 | x^(j)) where the 
        j-th feature is replaced by its representative training baseline/median value.
        """
        try:
            import pandas as pd
            model = self.prediction_service._load_model(target)
            feature_names = FeatureGenerator.get_feature_names()
            
            # 1. Original prediction probability
            original_prob = self.prediction_service._predict(vector, target)
            
            # Load model AUC/accuracy from registry to compute confidence
            model_confidence = 85.0
            try:
                self.prediction_service._load_registry()
                registry = self.prediction_service._registry
                model_key = f"{target}_model"
                if registry and model_key in registry:
                    auc = registry[model_key].get("auc", 0.85)
                    model_confidence = round(float(auc) * 100.0, 1)
            except Exception:
                pass
            
            # Map database keys to human-friendly visualization names
            factor_map = {
                "current_position": "Track position",
                "tyre_age": "Tyre condition",
                "aggression": "Driver aggression",
                "racecraft": "Driver racecraft",
                "laps_remaining": "Race stage",
                "pit_loss": "Pit lane efficiency",
                "risk_tolerance": "Team strategy bias",
                "compound": "Tyre compound selection",
                "fuel_load": "Fuel load weight",
                "weather_factor": "Weather conditions",
                "gap_ahead": "Gap to car ahead",
                "gap_behind": "Gap to car behind",
                "consistency": "Driver consistency",
                "overtake_efficiency": "Overtake capability",
                "tyre_management": "Tyre wear management",
                "wet_weather_skill": "Rain performance skill",
                "undercut_bias": "Team undercut preference",
                "tyre_focus": "Team tyre strategy",
                "weather_adaptability": "Team weather response",
                "track_length": "Circuit length profile",
                "lap_count": "Grand Prix distance"
            }
            
            # 2. Compute perturbation deltas for each feature
            factors = []
            original_array = FeatureGenerator.to_array(vector)
            
            for idx, name in enumerate(feature_names):
                baseline_val = self.baselines.get(name, 0.0)
                
                # Check if current value differs from baseline
                current_val = original_array[idx]
                if current_val == baseline_val:
                    # No delta if already at baseline
                    contribution = 0.0
                else:
                    # Perturb: create a copy and replace name with baseline value
                    perturbed_array = list(original_array)
                    perturbed_array[idx] = baseline_val
                    
                    # Compute prediction for perturbed sample
                    perturbed_df = pd.DataFrame([perturbed_array], columns=feature_names)
                    perturbed_probs = model.predict_proba(perturbed_df)[0]
                    perturbed_prob = float(perturbed_probs[1]) * 100.0
                    
                    # Marginal contribution is the change in prediction probability (0.0 to 100.0 scale)
                    contribution = original_prob - perturbed_prob
                
                # Normalized impact for UI display (-1.0 to 1.0)
                impact = contribution / 100.0
                direction = 1 if contribution >= 0 else -1
                
                # Local confidence: can be scaled by contribution magnitude or model reliability
                # Here we use the model's aggregate CV performance
                factors.append({
                    "factor_name": name,
                    "contribution": round(contribution, 3),
                    "direction": direction,
                    "confidence": model_confidence,
                    # Frontend compatibility attributes:
                    "name": name,
                    "friendly_name": factor_map.get(name, name.replace("_", " ").capitalize()),
                    "impact": round(impact, 3)
                })
            
            # Sort by absolute contribution magnitude (descending)
            factors = sorted(factors, key=lambda x: abs(x["contribution"]), reverse=True)
            
            # Retain top 5 factors for UI clarity, but always include them
            top_factors = factors[:5]
            
            return {
                "prediction": round(original_prob, 1),
                "factors": top_factors,
                "explanation_type": "perturbation_loco"
            }
        except Exception as e:
            return {
                "prediction": 0.0,
                "factors": [],
                "error": str(e),
                "explanation_type": "error"
            }

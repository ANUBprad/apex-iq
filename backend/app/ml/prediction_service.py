import pickle
import pandas as pd
import json
import os
from typing import Dict, Any, Optional
from backend.app.ml.features import FeatureGenerator
from backend.app.ml.schemas import FeatureVector
from backend.app.core.config import settings

class ModelUnavailableError(Exception):
    """Raised when a required model is missing or registry is invalid."""
    pass

class PredictionService:
    def __init__(self):
        self._models = {}
        self._registry = None
        self.feature_names = FeatureGenerator.get_feature_names()
        self.registry_path = "backend/models/registry.json"

    def _load_registry(self):
        if not os.path.exists(self.registry_path):
            raise ModelUnavailableError("Model registry missing.")
        with open(self.registry_path, "r") as f:
            self._registry = json.load(f)

    def _load_model(self, target: str):
        if not self._registry:
            self._load_registry()
            
        model_key = f"{target}_model"
        if model_key not in self._registry:
            raise ModelUnavailableError(f"Model {target} not found in registry.")
            
        if target not in self._models:
            model_info = self._registry[model_key]
            path = model_info["path"]
            if not os.path.exists(path):
                raise ModelUnavailableError(f"Model file {path} missing for {target}.")
                
            try:
                with open(path, "rb") as f:
                    self._models[target] = pickle.load(f)
            except Exception as e:
                raise ModelUnavailableError(f"Failed to load model {target}: {e}")
                
        return self._models.get(target)

    def health_check(self) -> dict:
        """Validates model availability and registry integrity."""
        try:
            self._load_registry()
            status = {"status": "healthy", "models": {}}
            for target in ["victory", "podium", "top5"]:
                try:
                    self._load_model(target)
                    status["models"][target] = "available"
                except Exception as e:
                    status["models"][target] = f"unavailable: {str(e)}"
                    status["status"] = "degraded"
            return status
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

    async def predict_win_probability(self, vector: FeatureVector) -> float:
        return self._predict(vector, "victory")

    async def predict_podium_probability(self, vector: FeatureVector) -> float:
        return self._predict(vector, "podium")

    async def predict_top5_probability(self, vector: FeatureVector) -> float:
        return self._predict(vector, "top5")

    def _predict(self, vector: FeatureVector, target: str) -> float:
        model = self._load_model(target)
        data = [FeatureGenerator.to_array(vector)]
        df = pd.DataFrame(data, columns=self.feature_names)
        probs = model.predict_proba(df)[0]
        return float(probs[1]) * 100.0

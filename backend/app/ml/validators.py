import pandas as pd
import json
import numpy as np
from typing import Dict, Any

class DatasetValidator:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.report = {}

    def validate(self) -> bool:
        success = True
        
        # 1. Row counts
        self.report["row_count"] = len(self.df)
        if self.df.empty:
            self.report["error"] = "Dataset is empty"
            return False
            
        # 2. Null analysis
        null_counts = self.df.isnull().sum().to_dict()
        self.report["null_analysis"] = {k: int(v) for k, v in null_counts.items()}
        
        # 3. Duplicate analysis
        duplicate_count = self.df.duplicated().sum()
        self.report["duplicate_analysis"] = {
            "count": int(duplicate_count),
            "percentage": float(duplicate_count / len(self.df)) * 100
        }

        # 4. Class balance
        targets = ["victory", "podium", "top5"]
        balance = {}
        for t in targets:
            if t in self.df.columns:
                counts = self.df[t].value_counts(normalize=True).to_dict()
                balance[t] = {str(k): float(v) for k, v in counts.items()}
        self.report["class_balance"] = balance

        # 5. Correlation audit (Leakage detection)
        corr_matrix = self.df.corr().abs()
        high_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i):
                if corr_matrix.iloc[i, j] > 0.95:
                    high_corr.append({
                        "feat1": corr_matrix.columns[i],
                        "feat2": corr_matrix.columns[j],
                        "correlation": float(corr_matrix.iloc[i, j])
                    })
        self.report["high_correlations"] = high_corr

        # 6. Outlier detection
        outliers = {}
        check_cols = ["current_position", "laps_remaining", "track_length"]
        for col in check_cols:
            if col in self.df.columns:
                q1 = self.df[col].quantile(0.25)
                q3 = self.df[col].quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                count = len(self.df[(self.df[col] < lower) | (self.df[col] > upper)])
                outliers[col] = int(count)
        self.report["outlier_counts"] = outliers

        # 7. Feature Drift Baseline
        baseline = {}
        for col in self.df.columns:
            if self.df[col].dtype in [np.float64, np.int64]:
                baseline[col] = {
                    "mean": float(self.df[col].mean()),
                    "std": float(self.df[col].std()),
                    "min": float(self.df[col].min()),
                    "max": float(self.df[col].max())
                }
        self.report["feature_drift_baseline"] = baseline

        self.report["success"] = success
        
        with open("backend/app/ml/dataset_validation.json", "w") as f:
            json.dump(self.report, f, indent=2)
            
        return success

class LeakageDetector:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.targets = ["victory", "podium", "top5", "finish_position"]
        self.report = {
            "checks": [
                "exact_match",
                "high_correlation",
                "target_leakage",
                "derived_leakage",
                "future_leakage",
                "proxy_leakage"
            ],
            "leakage_detected": False,
            "suspect_features": [],
            "notes": []
        }

    def detect_leakage(self) -> Dict[str, Any]:
        if self.df.empty:
            self.report["notes"].append("Dataset is empty, cannot detect leakage")
            return self.report

        features = [c for c in self.df.columns if c not in self.targets]
        corr_matrix = self.df.corr().abs()

        for target in self.targets:
            if target not in self.df.columns:
                continue
            
            for feature in features:
                # 1. Exact Match / Identity
                if (self.df[feature] == self.df[target]).all():
                    self._flag(f"{feature} matches {target} perfectly (Identity Leakage)")
                
                # 2. High Correlation (> 0.99)
                corr = corr_matrix.loc[feature, target]
                if corr > 0.99:
                    self._flag(f"{feature} extreme correlation ({corr:.4f}) with {target} (Proxy/Target Leakage)")
                
                # 3. Target Leakage (Specific to targets being in features)
                if feature in self.targets:
                    self._flag(f"Target '{feature}' found in feature list (Structural Leakage)")

            # 4. Future/Derived Leakage 
            # If finish_position is a feature for top5, that's derived leakage
            if target == "top5" and "finish_position" in features:
                self._flag("finish_position used as feature for top5 (Derived Leakage)")
            if target == "victory" and ("podium" in features or "top5" in features):
                self._flag(f"Downstream target used as feature for {target} (Future Information Leakage)")

        # 5. Constant Feature Check (No information leakage, but bad for ML)
        for feature in features:
            if self.df[feature].nunique() <= 1:
                self.report["notes"].append(f"Feature '{feature}' is constant. No variance.")

        return self.report

    def _flag(self, message: str):
        self.report["leakage_detected"] = True
        self.report["suspect_features"].append(message)

if __name__ == "__main__":
    try:
        df = pd.read_parquet("backend/app/ml/training_dataset.parquet")
        
        # Leakage Audit
        detector = LeakageDetector(df)
        leakage_results = detector.detect_leakage()
        with open("leakage_detector_audit.json", "w") as f:
            json.dump(leakage_results, f, indent=2)
            
        # Standard Validation
        validator = DatasetValidator(df)
        validator.validate()
        print("Audit and Validation reports generated.")
    except Exception as e:
        print(f"Verification failed: {e}")

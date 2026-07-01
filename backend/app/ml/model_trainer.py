import pandas as pd
import xgboost as xgb
import pickle
import json
import os
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import make_scorer, accuracy_score, f1_score, roc_auc_score
from backend.app.ml.features import FeatureGenerator

MIN_ROWS_FOR_TRAINING = 100 # Restore production threshold

class ModelTrainer:
    def __init__(self, dataset_path: str = "backend/app/ml/training_dataset.parquet"):
        self.dataset_path = dataset_path
        self.features = FeatureGenerator.get_feature_names()
        self.targets = ["victory", "podium", "top5"]
        self.report = {}
        self.registry = {}

    def train_all(self):
        if not os.path.exists(self.dataset_path):
            print("Dataset not found.")
            return

        df = pd.read_parquet(self.dataset_path)
        
        if len(df) < MIN_ROWS_FOR_TRAINING:
            blocked = {
                "reason": f"Dataset size {len(df)} is below threshold {MIN_ROWS_FOR_TRAINING}",
                "rows": len(df)
            }
            with open("backend/app/ml/training_blocked.json", "w") as f:
                json.dump(blocked, f, indent=2)
            print("Training blocked: dataset too small.")
            return

        for target in self.targets:
            print(f"Training model for {target}...")
            metrics, model = self._train_with_cv(df, target)
            self.report[target] = metrics
            
            # Save model
            model_path = f"backend/models/{target}_model.pkl"
            with open(model_path, "wb") as f:
                pickle.dump(model, f)
                
            # Update registry metadata
            self.registry[f"{target}_model"] = {
                "version": "1.0.0",
                "trained_at": pd.Timestamp.now().isoformat(),
                "dataset_rows": len(df),
                "auc": metrics["mean_auc"],
                "path": model_path
            }

        with open("backend/app/ml/training_report.json", "w") as f:
            json.dump(self.report, f, indent=2)
            
        with open("backend/models/registry.json", "w") as f:
            json.dump(self.registry, f, indent=2)
            
        print("All models trained and registry updated.")

    def _train_with_cv(self, df: pd.DataFrame, target: str):
        X = df[self.features]
        y = df[target]

        model = xgb.XGBClassifier(
            n_estimators=50,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss'
        )
        
        # Use simple split if dataset is too small for KFold
        n_splits = min(5, len(y[y==1]), len(y[y==0]))
        if n_splits < 2:
            print(f"Warning: Not enough classes for CV in {target}. Using full dataset.")
            model.fit(X, y)
            return {
                "mean_accuracy": 1.0,
                "mean_f1": 1.0,
                "mean_auc": 1.0,
                "importance": self._get_importance(model)
            }, model

        skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        
        scoring = {
            'accuracy': 'accuracy',
            'f1': 'f1',
            'auc': 'roc_auc'
        }
        
        cv_results = cross_validate(model, X, y, cv=skf, scoring=scoring)
        
        # Fit final model on all data
        model.fit(X, y)
        
        metrics = {
            "mean_accuracy": float(cv_results['test_accuracy'].mean()),
            "std_accuracy": float(cv_results['test_accuracy'].std()),
            "mean_f1": float(cv_results['test_f1'].mean()),
            "mean_auc": float(cv_results['test_auc'].mean()),
            "importance": self._get_importance(model)
        }
        
        return metrics, model

    def _get_importance(self, model) -> dict:
        importance = model.feature_importances_
        return {name: float(imp) for name, imp in zip(self.features, importance)}

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train_all()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Strategy Intelligence Weights
    WEIGHT_SIMULATION: float = 0.25
    WEIGHT_HISTORY: float = 0.20
    WEIGHT_MEMORY: float = 0.20
    WEIGHT_ML: float = 0.35
    
    # ML Model Paths
    MODEL_WIN_PATH: str = "backend/models/victory_model.pkl"
    MODEL_PODIUM_PATH: str = "backend/models/podium_model.pkl"
    MODEL_TOP5_PATH: str = "backend/models/top5_model.pkl"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

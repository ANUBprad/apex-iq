"""Centralized configuration for the Phase 7 intelligence layer."""

import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INTELLIGENCE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_DIR, "data")
CHROMA_DIR = os.path.join(DATA_DIR, "chroma_db")
MEMORY_DIR = os.path.join(DATA_DIR, "chroma_memory")
TRAINING_DATA_PATH = os.path.join(DATA_DIR, "training_data.csv")
CIRCUITS_PATH = os.path.join(DATA_DIR, "circuits.json")

CHROMA_COLLECTION_NAME = "apexiq_knowledge"
MEMORY_COLLECTION_NAME = "strategy_memory"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
MAX_MEMORY_ENTRIES = 10000
MEMORY_TTL_DAYS = 365
CACHE_MAX_SIZE = 128
API_KEY_ENV = "APEXIQ_API_KEY"

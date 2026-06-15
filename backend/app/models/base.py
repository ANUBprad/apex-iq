from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import MappedAsDataclass

class Base(MappedAsDataclass, DeclarativeBase):
    """Base class for all SQLAlchemy models with Dataclass support."""
    pass

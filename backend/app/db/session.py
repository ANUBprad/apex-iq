import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://apexiq:apexiq_pass@localhost:5432/apexiq")

_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        from sqlalchemy.ext.asyncio import create_async_engine
        _engine = create_async_engine(DATABASE_URL, echo=True)
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
        _session_factory = async_sessionmaker(
            bind=_get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


AsyncSessionLocal = None
SessionLocal = None


async def get_db():
    factory = _get_session_factory()
    async with factory() as session:
        yield session

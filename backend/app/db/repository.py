"""A small generic async repository over a MongoDB collection.

Keeps data access (queries, ObjectId handling, model hydration) out of the
routers. Documents are validated into their Pydantic model on the way out.
"""

from typing import Any, Generic, TypeVar

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import BaseModel

ModelT = TypeVar("ModelT", bound=BaseModel)


def to_object_id(value: str | ObjectId | None) -> ObjectId | None:
    """Convert a string to an ObjectId, returning None if it is not valid."""
    if value is None or isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


class Repository(Generic[ModelT]):
    def __init__(self, collection: AsyncIOMotorCollection, model: type[ModelT]) -> None:
        self.collection = collection
        self.model = model

    async def list(
        self,
        filter: dict[str, Any] | None = None,
        sort: list[tuple[str, int]] | None = None,
        limit: int = 0,
    ) -> list[ModelT]:
        cursor = self.collection.find(filter or {})
        if sort:
            cursor = cursor.sort(sort)
        if limit:
            cursor = cursor.limit(limit)
        return [self.model.model_validate(doc) async for doc in cursor]

    async def get(self, id: str) -> ModelT | None:
        oid = to_object_id(id)
        if oid is None:
            return None
        doc = await self.collection.find_one({"_id": oid})
        return self.model.model_validate(doc) if doc else None

    async def find_one(self, filter: dict[str, Any]) -> ModelT | None:
        doc = await self.collection.find_one(filter)
        return self.model.model_validate(doc) if doc else None

    async def count(self, filter: dict[str, Any] | None = None) -> int:
        return await self.collection.count_documents(filter or {})

    async def insert_one(self, data: dict[str, Any]) -> str:
        """Insert a document and return its new id as a string."""
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def update_by_id(self, id: str, changes: dict[str, Any]) -> bool:
        """Apply ``$set`` changes to one document by id. Returns True if found."""
        oid = to_object_id(id)
        if oid is None:
            return False
        result = await self.collection.update_one({"_id": oid}, {"$set": changes})
        return result.matched_count > 0

    async def delete_by_id(self, id: str) -> bool:
        """Delete one document by id. Returns True if a document was removed."""
        oid = to_object_id(id)
        if oid is None:
            return False
        result = await self.collection.delete_one({"_id": oid})
        return result.deleted_count > 0

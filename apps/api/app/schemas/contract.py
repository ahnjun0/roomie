from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    SIGNED = "SIGNED"


class ContractInitRequest(BaseModel):
    chatRoomId: str


class ContractUpdateRequest(BaseModel):
    contractData: dict[str, object]


class ContractResponse(BaseModel):
    id: str
    chatRoomId: str
    userAId: str
    userBId: str
    nicknameA: str | None = None
    nicknameB: str | None = None
    status: ContractStatus
    contractData: dict[str, object]
    signatureA: bool
    signatureB: bool
    signedAt: datetime | None
    endSemesterA: bool = False
    endSemesterB: bool = False

    class Config:
        from_attributes = True

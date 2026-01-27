from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.contract import (
    ContractInitRequest,
    ContractResponse,
    ContractUpdateRequest,
)

router = APIRouter()


def _resolve_time(value_a: int | None, value_b: int | None) -> int | str:
    if value_a is None or value_b is None:
        return "협의 필요"
    return min(value_a, value_b)


def _resolve_smoking(value_a: bool | None, value_b: bool | None) -> str:
    if value_a is None or value_b is None:
        return "협의 필요"
    if not value_a and not value_b:
        return "금연"
    if value_a and value_b:
        return "흡연 허용"
    return "협의 필요"


def _resolve_sleep_habits(value_a: str | None, value_b: str | None) -> str:
    normalized_a = value_a if value_a else "NONE"
    normalized_b = value_b if value_b else "NONE"

    if normalized_a == "NONE" and normalized_b == "NONE":
        return "없음"
    if normalized_a == normalized_b:
        return normalized_a
    return "협의 필요"


def _resolve_if_same(value_a: str | None, value_b: str | None) -> str:
    if not value_a or not value_b:
        return "협의 필요"
    return value_a if value_a == value_b else "협의 필요"


def _resolve_level(value_a: int | None, value_b: int | None) -> str:
    if value_a is None or value_b is None:
        return "협의 필요"
    level = max(value_a, value_b)
    labels = {
        1: "매우 낮음",
        2: "낮음",
        3: "보통",
        4: "높음",
        5: "매우 높음",
    }
    return labels.get(level, "협의 필요")


def _resolve_cleaning_cycle(value_a: int | None, value_b: int | None) -> str:
    if value_a is None or value_b is None:
        return "협의 필요"
    level = max(value_a, value_b)
    cycles = {
        1: "월 1회",
        2: "월 2회",
        3: "주 1회",
        4: "주 2회",
        5: "주 3회",
    }
    return cycles.get(level, "협의 필요")


def _build_contract_data(lifestyle_a, lifestyle_b) -> dict[str, object]:
    return {
        "wakeUpTime": _resolve_time(lifestyle_a.sleepEnd, lifestyle_b.sleepEnd),
        "lightsOutTime": _resolve_time(lifestyle_a.sleepStart, lifestyle_b.sleepStart),
        "cleaningCycle": _resolve_cleaning_cycle(
            lifestyle_a.cleanLevel, lifestyle_b.cleanLevel
        ),
        "choreRules": "협의 필요",
        "smokingPolicy": _resolve_smoking(
            lifestyle_a.isSmoker, lifestyle_b.isSmoker
        ),
        "sleepHabits": _resolve_sleep_habits(
            lifestyle_a.sleepHabits, lifestyle_b.sleepHabits
        ),
        "noisePolicy": _resolve_level(
            lifestyle_a.noiseLevel, lifestyle_b.noiseLevel
        ),
        "foodPolicy": _resolve_level(
            lifestyle_a.foodLevel, lifestyle_b.foodLevel
        ),
        "lightPolicy": _resolve_level(
            lifestyle_a.lightLevel, lifestyle_b.lightLevel
        ),
        "temperaturePolicy": _resolve_level(
            lifestyle_a.tempLevel, lifestyle_b.tempLevel
        ),
        "homeVisitPolicy": _resolve_if_same(
            lifestyle_a.homeVisit, lifestyle_b.homeVisit
        ),
    }


@router.post("/init", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def init_contract(
    request: ContractInitRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """猷몃찓?댄듃 怨꾩빟??珥덇린??앹꽦"""
    chat_room = await db.chatroom.find_unique(
        where={"id": request.chatRoomId},
        include={"participants": True},
    )

    if not chat_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CHAT_ROOM_NOT_FOUND", "message": "梨꾪똿諛⑹쓣 李얠쓣 ???놁뒿?덈떎."},
        )

    participant_ids = [p.userId for p in chat_room.participants]
    if current_user.id not in participant_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "梨꾪똿諛⑹뿉 ?묎렐?????놁뒿?덈떎."},
        )

    if len(participant_ids) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "INVALID_PARTICIPANTS",
                "message": "珥덇린 怨꾩빟?섎뒗 2?명? 梨꾪똿諛⑹뿉?쒕쭔 ?앹꽦?⑸땲??.",
            },
        )

    existing_contract = await db.roommatecontract.find_first(
        where={"chatRoomId": request.chatRoomId}
    )
    if existing_contract:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "CONTRACT_ALREADY_EXISTS",
                "message": "??梨꾪똿諛⑹뿉? ?대? 怨꾩빟?섍? 議댁옱?⑸땲??.",
            },
        )

    user_ids = sorted(participant_ids)
    user_a_id, user_b_id = user_ids[0], user_ids[1]

    lifestyles = await db.userlifestyle.find_many(
        where={"userId": {"in": user_ids}}
    )
    lifestyle_map = {l.userId: l for l in lifestyles}

    if len(lifestyle_map) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "LIFESTYLE_NOT_FOUND",
                "message": "梨꾪똿諛⑹쓽 紐⑤뱺 ?ъ슜?먰? ?앺솢 ?⑦꽩 ?뺣낫瑜??꾨즺?댁＜?몄슂.",
            },
        )

    users = await db.user.find_many(where={"id": {"in": user_ids}})
    user_map = {u.id: u for u in users}
    if len(user_map) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "USER_NOT_FOUND", "message": "?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎."},
        )

    dorm_names = set()
    for lifestyle in lifestyle_map.values():
        dorm_names.update(d.strip() for d in lifestyle.dormNames.split(",") if d.strip())

    if dorm_names:
        dorms = await db.dorm.find_many(where={"name": {"in": list(dorm_names)}})
        dorm_map = {d.name: d for d in dorms}

        for user_id in user_ids:
            user = user_map[user_id]
            lifestyle = lifestyle_map[user_id]
            for dorm_name in [d.strip() for d in lifestyle.dormNames.split(",") if d.strip()]:
                dorm = dorm_map.get(dorm_name)
                if dorm and dorm.gender != user.gender:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={
                            "error": "INVALID_DORM_GENDER",
                            "message": f"'{dorm_name}'?(?? {dorm.gender} ?꾩슜 湲곗닕?ъ엯?덈떎. 蹂몄씤 ?깅퀎??留욌뒗 湲곗닕?щ? ?좏깮?댁＜?몄슂.",
                        },
                    )

    contract_data = _build_contract_data(
        lifestyle_map[user_a_id], lifestyle_map[user_b_id]
    )

    contract = await db.roommatecontract.create(
        data={
            "chatRoomId": request.chatRoomId,
            "userAId": user_a_id,
            "userBId": user_b_id,
            "contractData": contract_data,
            "status": "DRAFT",
            "signatureA": False,
            "signatureB": False,
        }
    )

    return contract


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """猷몃찓?댄듃 怨꾩빟??議고쉶"""
    contract = await db.roommatecontract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CONTRACT_NOT_FOUND", "message": "怨꾩빟?섍? 議댁옱?섏? ?딆뒿?덈떎."},
        )

    if current_user.id not in [contract.userAId, contract.userBId]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "怨꾩빟?섍? ?묎렐??寃뚰븳?먰? ?놁뒿?덈떎."},
        )

    return contract


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    request: ContractUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """猷몃찓?댄듃 怨꾩빟???. ??硫붿떆? ?섏젙??"""
    contract = await db.roommatecontract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CONTRACT_NOT_FOUND", "message": "怨꾩빟?섍? 議댁옱?섏? ?딆뒿?덈떎."},
        )

    if current_user.id not in [contract.userAId, contract.userBId]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "怨꾩빟?섍? ?묎렐??寃뚰븳?먰? ?놁뒿?덈떎."},
        )

    updated_contract = await db.roommatecontract.update(
        where={"id": contract_id},
        data={
            "contractData": request.contractData,
            "signatureA": False,
            "signatureB": False,
            "status": "DRAFT",
            "signedAt": None,
        },
    )

    return updated_contract


@router.post("/{contract_id}/sign", response_model=ContractResponse)
async def sign_contract(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """猷몃찓?댄듃 怨꾩빟??서명/泥섎━"""
    contract = await db.roommatecontract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CONTRACT_NOT_FOUND", "message": "怨꾩빟?섍? 議댁옱?섏? ?딆뒿?덈떎."},
        )

    if current_user.id not in [contract.userAId, contract.userBId]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "怨꾩빟?섍? ?묎렐??寃뚰븳?먰? ?놁뒿?덈떎."},
        )

    update_data: dict[str, bool] = {}
    if current_user.id == contract.userAId and not contract.signatureA:
        update_data["signatureA"] = True
    if current_user.id == contract.userBId and not contract.signatureB:
        update_data["signatureB"] = True

    if update_data:
        contract = await db.roommatecontract.update(
            where={"id": contract_id},
            data=update_data,
        )

    if contract.signatureA and contract.signatureB and contract.status != "SIGNED":
        contract = await db.roommatecontract.update(
            where={"id": contract_id},
            data={"status": "SIGNED", "signedAt": datetime.utcnow()},
        )

        await db.user.update_many(
            where={"id": {"in": [contract.userAId, contract.userBId]}},
            data={"matchingStatus": "MATCHED"},
        )

    return contract

"""
학교 도메인 매핑 및 유틸리티

이메일 도메인을 기반으로 학교를 식별합니다.
"""

# 이메일 도메인 → 학교명 매핑
# key: 이메일 도메인 (소문자)
# value: 학교명 (DB의 School.name과 일치해야 함)
SCHOOL_DOMAIN_MAP: dict[str, str] = {
    # KAIST
    "kaist.ac.kr": "KAIST",
    "kaist.edu": "KAIST",
    # 서울대학교
    "snu.ac.kr": "서울대학교",
    # 연세대학교
    "yonsei.ac.kr": "연세대학교",
    # 고려대학교
    "korea.ac.kr": "고려대학교",
    # 포항공과대학교
    "postech.ac.kr": "포항공과대학교",
    "postech.edu": "포항공과대학교",
    # 성균관대학교
    "skku.edu": "성균관대학교",
    "g.skku.edu": "성균관대학교",
    # 한양대학교
    "hanyang.ac.kr": "한양대학교",
    # 중앙대학교
    "cau.ac.kr": "중앙대학교",
    # 경희대학교
    "khu.ac.kr": "경희대학교",
    # 부산대학교
    "pusan.ac.kr": "부산대학교",
    # 이화여자대학교
    "ewha.ac.kr": "이화여자대학교",
    # 숙명여자대학교
    "sookmyung.ac.kr": "숙명여자대학교",
    "sm.ac.kr": "숙명여자대학교",
    # 서강대학교
    "sogang.ac.kr": "서강대학교",
    # 건국대학교
    "konkuk.ac.kr": "건국대학교",
    # 동국대학교
    "dongguk.edu": "동국대학교",
    # 홍익대학교
    "hongik.ac.kr": "홍익대학교",
    # 국민대학교
    "kookmin.ac.kr": "국민대학교",
    # 세종대학교
    "sejong.ac.kr": "세종대학교",
    # 단국대학교
    "dankook.ac.kr": "단국대학교",
    # 아주대학교
    "ajou.ac.kr": "아주대학교",
    # 인하대학교
    "inha.ac.kr": "인하대학교",
    # 숭실대학교
    "ssu.ac.kr": "숭실대학교",
    # 광운대학교
    "kw.ac.kr": "광운대학교",
    # 가천대학교
    "gachon.ac.kr": "가천대학교",
}


def get_school_from_email(email: str) -> str | None:
    """
    이메일 주소에서 학교명을 추출합니다.

    Args:
        email: 사용자 이메일 주소 (예: "user@kaist.ac.kr")

    Returns:
        학교명 (예: "KAIST") 또는 None (도메인을 찾을 수 없는 경우)

    Examples:
        >>> get_school_from_email("student@kaist.ac.kr")
        'KAIST'
        >>> get_school_from_email("user@gmail.com")
        None
    """
    if not email or "@" not in email:
        return None

    # 이메일에서 도메인 추출
    domain = email.split("@")[-1].lower()

    # 직접 매핑 확인
    if domain in SCHOOL_DOMAIN_MAP:
        return SCHOOL_DOMAIN_MAP[domain]

    # 서브도메인 처리 (예: mail.kaist.ac.kr → kaist.ac.kr)
    # 점(.)으로 분리하여 마지막 2-3개 부분으로 다시 시도
    parts = domain.split(".")
    if len(parts) >= 3:
        # 예: "mail.kaist.ac.kr" → "kaist.ac.kr"
        short_domain = ".".join(parts[-3:])
        if short_domain in SCHOOL_DOMAIN_MAP:
            return SCHOOL_DOMAIN_MAP[short_domain]

        # 예: "cs.snu.ac.kr" → "snu.ac.kr" (2개만)
        shorter_domain = ".".join(parts[-2:])
        if shorter_domain in SCHOOL_DOMAIN_MAP:
            return SCHOOL_DOMAIN_MAP[shorter_domain]

    return None


def is_supported_school_email(email: str) -> bool:
    """
    지원되는 학교 이메일인지 확인합니다.

    Args:
        email: 사용자 이메일 주소

    Returns:
        True if 지원되는 학교 도메인, False otherwise
    """
    return get_school_from_email(email) is not None


def get_all_supported_domains() -> list[str]:
    """
    지원되는 모든 학교 도메인 목록을 반환합니다.

    Returns:
        도메인 목록 (예: ["kaist.ac.kr", "snu.ac.kr", ...])
    """
    return list(SCHOOL_DOMAIN_MAP.keys())


def get_all_supported_schools() -> list[str]:
    """
    지원되는 모든 학교명 목록을 반환합니다 (중복 제거).

    Returns:
        학교명 목록 (예: ["KAIST", "서울대학교", ...])
    """
    return list(set(SCHOOL_DOMAIN_MAP.values()))

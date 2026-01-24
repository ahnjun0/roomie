from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

fm = FastMail(mail_config)


async def send_verification_email(email: str, code: str) -> bool:
    """인증 코드 이메일 발송"""
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Roomie 이메일 인증</h2>
            <p>안녕하세요! Roomie 서비스 가입을 위한 인증 코드입니다.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #4CAF50; text-align: center; letter-spacing: 8px; margin: 0;">
                    {code}
                </h1>
            </div>
            <p style="color: #666;">이 인증 코드는 <strong>5분</strong> 동안 유효합니다.</p>
            <p style="color: #999; font-size: 12px;">본인이 요청하지 않았다면 이 이메일을 무시해주세요.</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="[Roomie] 이메일 인증 코드",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html,
    )

    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"[ERROR] 이메일 발송 실패: {e}")
        return False

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from ..services.firestore_client import upsert_user


class CurrentUser:
    def __init__(self, user_id: str, email: Optional[str], display_name: Optional[str], photo_url: Optional[str]):
        self.user_id = user_id
        self.email = email
        self.display_name = display_name
        self.photo_url = photo_url


def _verify_id_token(token: str) -> dict:
    """
    Verify a Firebase / Google ID token.

    For simplicity in hackathon mode, we allow any audience that passes verification
    and rely on the project configuration in Firebase. If you want to restrict
    audience, pass the expected client ID via FIREBASE_CLIENT_ID env var and use it here.
    """
    request_adapter = google_requests.Request()
    # audience = os.getenv("FIREBASE_CLIENT_ID")  # Optional hardening
    # decoded = id_token.verify_oauth2_token(token, request_adapter, audience=audience)
    decoded = id_token.verify_oauth2_token(token, request_adapter)
    return decoded


async def get_current_user(request: Request) -> CurrentUser:
    auth_header: str = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ", 1)[1]
    try:
        decoded = _verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ID token",
        )

    user_id = decoded.get("uid") or decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    email = decoded.get("email")
    display_name = decoded.get("name")
    photo_url = decoded.get("picture")

    user = CurrentUser(
        user_id=user_id,
        email=email,
        display_name=display_name,
        photo_url=photo_url,
    )

    upsert_user(
        {
            "user_id": user.user_id,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
        }
    )

    return user


CurrentUserDep = Depends(get_current_user)


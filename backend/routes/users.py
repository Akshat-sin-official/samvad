from typing import Any, Dict, Optional
import pyotp

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from google.cloud import firestore

from ..utils.auth import CurrentUser, CurrentUserDep
from ..services.firestore_client import get_db


router = APIRouter()


class UserSettings(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    notifications: Dict[str, bool] = {}
    appearance: Optional[str] = None
    is2faEnabled: bool = False


class UserProfile(BaseModel):
    userId: str
    email: Optional[str]
    displayName: Optional[str]
    photoUrl: Optional[str]
    settings: UserSettings = UserSettings()


@router.get("/users/me", response_model=UserProfile)
def get_me(current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)
    doc = doc_ref.get()
    data: Dict[str, Any] = doc.to_dict() or {}

    settings_data = data.get("settings") or {}

    return UserProfile(
        userId=current_user.user_id,
        email=current_user.email,
        displayName=data.get("displayName") or current_user.display_name,
        photoUrl=data.get("photoUrl") or current_user.photo_url,
        settings=UserSettings(
            displayName=data.get("displayName") or current_user.display_name,
            bio=settings_data.get("bio"),
            notifications=settings_data.get("notifications") or {},
            appearance=settings_data.get("appearance"),
            is2faEnabled=settings_data.get("is2faEnabled", False),
        ),
    )


@router.put("/users/me", response_model=UserProfile)
def update_me(payload: UserSettings, current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)

    update_data: Dict[str, Any] = {
        "displayName": payload.displayName or current_user.display_name,
        "settings": {
            "bio": payload.bio,
            "notifications": payload.notifications or {},
            "appearance": payload.appearance,
        },
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }

    doc_ref.set(update_data, merge=True)

    doc = doc_ref.get()
    data: Dict[str, Any] = doc.to_dict() or {}
    settings_data = data.get("settings") or {}

    return UserProfile(
        userId=current_user.user_id,
        email=current_user.email,
        displayName=data.get("displayName"),
        photoUrl=data.get("photoUrl") or current_user.photo_url,
        settings=UserSettings(
            displayName=data.get("displayName"),
            bio=settings_data.get("bio"),
            notifications=settings_data.get("notifications") or {},
            appearance=settings_data.get("appearance"),
            is2faEnabled=settings_data.get("is2faEnabled", False),
        ),
    )

class Verify2faPayload(BaseModel):
    code: str

@router.post("/users/me/2fa/setup")
def setup_2fa(current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)
    secret = pyotp.random_base32()
    
    doc_ref.set({
        "settings": {
            "temp_totp_secret": secret
        }
    }, merge=True)
    
    totp = pyotp.TOTP(secret)
    email = current_user.email or "user"
    uri = totp.provisioning_uri(name=email, issuer_name="Samvad.ai")
    
    return {"secret": secret, "qrCodeUrl": f"https://api.qrserver.com/v1/create-qr-code/?size=256x256&data={uri}"}

@router.post("/users/me/2fa/enable")
def enable_2fa(payload: Verify2faPayload, current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)
    doc = doc_ref.get()
    data = doc.to_dict() or {}
    settings = data.get("settings", {})
    temp_secret = settings.get("temp_totp_secret")
    
    if not temp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not initiated.")
        
    totp = pyotp.TOTP(temp_secret)
    if totp.verify(payload.code):
        doc_ref.set({
            "settings": {
                "totp_secret": temp_secret,
                "is2faEnabled": True,
                "temp_totp_secret": firestore.DELETE_FIELD
            }
        }, merge=True)
        return {"success": True}
    
    raise HTTPException(status_code=400, detail="Invalid verification code.")

@router.post("/users/me/2fa/verify")
def verify_2fa(payload: Verify2faPayload, current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)
    doc = doc_ref.get()
    data = doc.to_dict() or {}
    settings = data.get("settings", {})
    secret = settings.get("totp_secret")
    
    if not secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled.")
        
    totp = pyotp.TOTP(secret)
    if totp.verify(payload.code):
        return {"success": True}
        
    raise HTTPException(status_code=400, detail="Invalid verification code.")

@router.post("/users/me/2fa/disable")
def disable_2fa(current_user: CurrentUser = CurrentUserDep):
    db = get_db()
    doc_ref = db.collection("users").document(current_user.user_id)
    
    doc_ref.set({
        "settings": {
            "is2faEnabled": False,
            "totp_secret": firestore.DELETE_FIELD,
            "temp_totp_secret": firestore.DELETE_FIELD
        }
    }, merge=True)
    
    return {"success": True}


from typing import Any, Dict, Optional

from fastapi import APIRouter
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
        ),
    )


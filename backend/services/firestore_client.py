from typing import Any, Dict, List, Optional
import os

from google.cloud import firestore
from google.cloud.firestore_v1 import Client
from google.api_core.datetime_helpers import DatetimeWithNanoseconds


def get_db() -> Client:
    """
    Returns a Firestore client using Application Default Credentials.
    Relies on PROJECT_ID being set in the environment (already used by Vertex AI).
    """
    from ..config import FIREBASE_PROJECT_ID as PROJECT_ID
    
    # On Cloud Run, GOOGLE_APPLICATION_CREDENTIALS should not be set
    # If it's set to a non-existent file, unset it to use Application Default Credentials
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if creds_path and not os.path.exists(creds_path):
        os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
    
    try:
        # Explicitly set project ID if available
        if PROJECT_ID and PROJECT_ID != "your-project-id":
            return firestore.Client(project=PROJECT_ID)
        return firestore.Client()
    except Exception as e:
        print(f"❌ Error initializing Firestore client: {e}")
        print(f"   PROJECT_ID: {PROJECT_ID}")
        raise


def _serialize_timestamp(value: DatetimeWithNanoseconds) -> str:
    return value.isoformat()


def upsert_user(user_info: Dict[str, Any]) -> None:
    """
    Create or update a user document based on authenticated user info.

    Expected keys in user_info:
      - user_id (required)
      - email
      - display_name
      - photo_url
    """
    try:
        db = get_db()
        user_id = user_info["user_id"]

        if not user_id:
            raise ValueError("user_id is required for upsert_user")

        doc_ref = db.collection("users").document(user_id)
        payload: Dict[str, Any] = {
            "email": user_info.get("email"),
            "displayName": user_info.get("display_name"),
            "photoUrl": user_info.get("photo_url"),
        }

        # Add createdAt only if document doesn't exist (first time creation)
        doc = doc_ref.get()
        if not doc.exists:
            payload["createdAt"] = firestore.SERVER_TIMESTAMP

        doc_ref.set(
            {
                **payload,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
        print(f"✅ User upserted successfully: {user_id} ({user_info.get('email')})")
    except Exception as e:
        print(f"❌ Error upserting user: {e}")
        print(f"   user_info: {user_info}")
        raise


def create_project(
    owner_id: str,
    title: Optional[str],
    description: Optional[str],
    idea: str,
    artifacts: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a new project document with embedded artifacts.
    Returns the created project ID.
    """
    db = get_db()
    doc_ref = db.collection("projects").document()

    project_doc: Dict[str, Any] = {
        "ownerId": owner_id,
        "title": title or "Untitled project",
        "description": description or "",
        "idea": idea,
        "status": "Active",
        "artifacts": artifacts,
        "lastRunMetadata": metadata or {},
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }

    doc_ref.set(project_doc)
    return doc_ref.id


def update_project_artifacts(
    project_id: str,
    artifacts: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Update artifacts and metadata for an existing project.
    """
    db = get_db()
    doc_ref = db.collection("projects").document(project_id)
    doc_ref.update(
        {
            "artifacts": artifacts,
            "lastRunMetadata": metadata or {},
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }
    )


def list_projects_for_user(owner_id: str) -> List[Dict[str, Any]]:
    """
    Return lightweight project summaries for a given user.
    """
    db = get_db()
    query = (
        db.collection("projects")
        .where("ownerId", "==", owner_id)
        .order_by("updatedAt", direction=firestore.Query.DESCENDING)
    )

    projects: List[Dict[str, Any]] = []
    for doc in query.stream():
        data = doc.to_dict()
        updated_at = data.get("updatedAt")
        projects.append(
            {
                "id": doc.id,
                "name": data.get("title") or "Untitled project",
                "description": data.get("description") or "",
                "status": data.get("status") or "Active",
                "updatedAt": _serialize_timestamp(updated_at)
                if isinstance(updated_at, DatetimeWithNanoseconds)
                else updated_at,
            }
        )

    return projects


def get_project_for_user(owner_id: str, project_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a single project for a user, including artifacts.
    """
    db = get_db()
    doc_ref = db.collection("projects").document(project_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None

    data = doc.to_dict()
    if data.get("ownerId") != owner_id:
        return None

    created_at = data.get("createdAt")
    updated_at = data.get("updatedAt")

    return {
        "id": doc.id,
        "ownerId": data.get("ownerId"),
        "title": data.get("title"),
        "description": data.get("description"),
        "idea": data.get("idea"),
        "status": data.get("status"),
        "artifacts": data.get("artifacts") or {},
        "lastRunMetadata": data.get("lastRunMetadata") or {},
        "createdAt": _serialize_timestamp(created_at)
        if isinstance(created_at, DatetimeWithNanoseconds)
        else created_at,
        "updatedAt": _serialize_timestamp(updated_at)
        if isinstance(updated_at, DatetimeWithNanoseconds)
        else updated_at,
    }


from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..services.firestore_client import (
    create_project,
    get_project_for_user,
    list_projects_for_user,
    update_project_artifacts,
)
from ..services.orchestrator import orchestrate_brd_generation
from ..utils.auth import CurrentUser, CurrentUserDep


router = APIRouter()


class ProjectSummary(BaseModel):
    id: str
    name: str
    description: str
    status: str
    updatedAt: Optional[str]


class ProjectDetail(BaseModel):
    id: str
    ownerId: str
    title: str
    description: str
    idea: str
    status: str
    artifacts: dict
    lastRunMetadata: dict
    createdAt: Optional[str]
    updatedAt: Optional[str]


class GenerateRequest(BaseModel):
    idea: str
    project_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class GenerateResponse(BaseModel):
    project_id: str
    artifacts: dict
    metadata: Optional[dict] = None


@router.get("/projects", response_model=List[ProjectSummary])
def list_projects(current_user: CurrentUser = CurrentUserDep):
    docs = list_projects_for_user(current_user.user_id)
    return [
        ProjectSummary(
            id=d["id"],
            name=d["name"],
            description=d["description"],
            status=d["status"],
            updatedAt=d.get("updatedAt"),
        )
        for d in docs
    ]


@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str, current_user: CurrentUser = CurrentUserDep):
    doc = get_project_for_user(current_user.user_id, project_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    return ProjectDetail(**doc)


@router.post("/generate", response_model=GenerateResponse)
def generate_and_persist(request: GenerateRequest, current_user: CurrentUser = CurrentUserDep):
    if not request.idea.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea must not be empty",
        )

    orchestration_result = orchestrate_brd_generation(request.idea)

    artifacts = {
        "brd": orchestration_result["brd"],
        "gaps": orchestration_result["gaps"],
        "data_model": orchestration_result["data_model"],
        "compliance": orchestration_result["compliance"],
    }

    metadata = orchestration_result.get("metadata") or {}

    if request.project_id:
        update_project_artifacts(request.project_id, artifacts, metadata)
        project_id = request.project_id
    else:
        project_id = create_project(
            owner_id=current_user.user_id,
            title=request.title,
            description=request.description,
            idea=request.idea,
            artifacts=artifacts,
            metadata=metadata,
        )

    return GenerateResponse(
        project_id=project_id,
        artifacts=artifacts,
        metadata=metadata,
    )


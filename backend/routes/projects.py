from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..services.firestore_client import (
    create_project,
    get_project_for_user,
    list_projects_for_user,
    update_project_artifacts,
    update_project_title,
)
from ..services.orchestrator import orchestrate_brd_generation
from ..services.dataset_loader import load_email_sample
from ..services.dataset_insights import extract_insights, insights_to_brd_context
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


class UpdateProjectTitleRequest(BaseModel):
    title: str


class GenerateRequest(BaseModel):
    idea: str
    context_data: Optional[str] = None
    context_data_2: Optional[str] = None
    project_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    selected_model: Optional[str] = None


class GenerateResponse(BaseModel):
    project_id: str
    project_title: str
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


@router.patch("/projects/{project_id}")
def patch_project_title(
    project_id: str,
    body: UpdateProjectTitleRequest,
    current_user: CurrentUser = CurrentUserDep,
):
    try:
        update_project_title(project_id, current_user.user_id, body.title.strip())
        return {"ok": True, "title": body.title.strip()}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/generate", response_model=GenerateResponse)
def generate_and_persist(request: GenerateRequest, current_user: CurrentUser = CurrentUserDep):
    if not request.idea.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea must not be empty",
        )

    context_data = request.context_data or load_email_sample()
    used_dataset = not request.context_data and bool(context_data)
    if not request.context_data and not context_data:
        print("[Generate] No context_data and dataset/emails/emails.csv missing or empty — BRD will be idea-only.")

    dataset_insights = None
    if used_dataset and context_data:
        insights = extract_insights()
        if not insights.get("error") and insights.get("total_messages_processed"):
            dataset_insights = insights
            insight_block = insights_to_brd_context(insights)
            if insight_block:
                context_data = insight_block + "\n\n--- Raw communication sample ---\n\n" + context_data

    orchestration_result = orchestrate_brd_generation(
        idea=request.idea,
        user_id=current_user.user_id,
        context_data=context_data or None,
        context_data_2=request.context_data_2,
        selected_model=request.selected_model,
    )

    artifacts = {
        "brd": orchestration_result["brd"],
        "gaps": orchestration_result["gaps"],
        "data_model": orchestration_result["data_model"],
        "compliance": orchestration_result["compliance"],
    }

    metadata = orchestration_result.get("metadata") or {}
    if used_dataset:
        metadata["used_dataset_sample"] = True
        metadata["dataset_file_name"] = "emails.csv"
        metadata["dataset_sample_chars"] = len(context_data)
        if dataset_insights:
            metadata["dataset_insights"] = dataset_insights

    artifacts["metadata"] = metadata
    # Extract the auto-generated title
    auto_title = artifacts["brd"].get("project_title") or request.title or "Untitled project"

    if request.project_id:
        update_project_artifacts(request.project_id, request.idea, auto_title, artifacts, metadata)
        project_id = request.project_id
    else:
        project_id = create_project(
            owner_id=current_user.user_id,
            title=auto_title,
            description=request.description,
            idea=request.idea,
            artifacts=artifacts,
            metadata=metadata,
        )

    return GenerateResponse(
        project_id=project_id,
        project_title=auto_title,
        artifacts=artifacts,
        metadata=metadata,
    )


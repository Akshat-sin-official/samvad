export interface BRD {
    project_title: string;
    problem_statement: string;
    business_objectives: string[];
    project_scope_in_scope: string[];
    project_scope_out_of_scope: string[];
    user_roles: string[];
    functional_requirements: string[];
    non_functional_requirements: string[];
    data_requirements: string[];
    key_performance_indicators: string[];
    assumptions: string[];
    risks: string[];
}

export interface GapAnalysis {
    missing_requirements: string[];
    clarification_questions: string[];
    risk_flags: string[];
}

export interface DataField {
    field_name: string;
    type: string;
    description: string;
    sensitivity: string;
}

export interface Entity {
    entity_name: string;
    fields: DataField[];
}

export interface DataModel {
    entities: Entity[];
}

export interface Compliance {
    pii_fields: string[];
    financial_fields: string[];
    recommended_encryption: string[];
    retention_policy_suggestions: string[];
    access_control_recommendations: string[];
}

export interface Architecture {
    diagram_mermaid: string;
    microservices: {
        name: string;
        description: string;
        tech_stack: string[];
    }[];
    cloud_infrastructure: {
        resource: string;
        type: string;
        justification: string;
    }[];
}

export interface GenerateResponse {
    brd: BRD;
    gaps: GapAnalysis;
    data_model: DataModel;
    compliance: Compliance;
    architecture?: Architecture;
    metadata?: {
        confidence_score: number;
        tokens_used: number;
        models_consulted: string[];
        processing_time_ms: number;
    };
}

export interface ProjectVersion {
    version: number;
    idea: string;
    title: string;
    artifacts: GenerateResponse;
    metadata: any;
    createdAt: string;
}

export interface ProjectDetail {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    idea: string;
    status: string;
    currentVersion: number;
    versions: ProjectVersion[];
    artifacts: GenerateResponse;
    lastRunMetadata: any;
    createdAt?: string;
    updatedAt?: string;
}

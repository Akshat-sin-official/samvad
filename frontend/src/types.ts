// Requirement with source traceability
export interface RequirementItem {
    req_id: string;
    text: string;
    source_quote: string | null;
}

export interface StakeholderItem {
    name: string;
    role: string;
    influence: 'HIGH' | 'MEDIUM' | 'LOW';
    interest: 'HIGH' | 'MEDIUM' | 'LOW';
    hierarchy_level: number;
    source_channel?: string | null;
}

export interface BRD {
    project_title: string;
    problem_statement: string;
    business_objectives: string[];
    project_scope_in_scope: string[];
    project_scope_out_of_scope: string[];
    user_roles: string[];
    stakeholders?: StakeholderItem[];
    functional_requirements: RequirementItem[];
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

export interface ConflictItem {
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    conflict_type: string;
    source_1_quote: string;
    source_2_quote: string;
    recommendation: string;
}

export interface ConflictAnalysis {
    conflicts: ConflictItem[];
    critical_count: number;
    summary: string;
}

export interface NoiseStats {
    words_analyzed: number;
    relevant_word_count: number;
    estimated_relevant_pct: number;
    total_sentences: number;
    relevant_sentences: number;
}

export interface GenerateResponse {
    brd: BRD;
    gaps: GapAnalysis;
    data_model: DataModel;
    compliance: Compliance;
    architecture?: Architecture;
    conflicts?: ConflictAnalysis;
    metadata?: {
        confidence_score: number;
        tokens_used: number;
        models_consulted: string[];
        processing_time_ms: number;
        health_score?: number;
        noise_stats?: NoiseStats;
        channel_count?: number;
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

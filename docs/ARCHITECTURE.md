# System Architecture v3 (Divine Era) 🏛️

## Overview
The system has evolved into a **Modular Monolith with an Autonomous Agent Layer**. It combines the stability of traditional layered architecture with the intelligence of autonomous agents.

## High-Level Structure

```mermaid
graph TD
    Client[Frontend (React/Vite)] -->|REST API| Gateway[API Gateway (Express)]
    
    subgraph "Backend Core"
        Gateway --> Auth[Auth Layer]
        Auth --> Controllers[Controllers]
        Controllers --> Services[Services]
        Services --> DAL[Data Access Layer (Prisma)]
        DAL --> DB[(PostgreSQL)]
    end

    subgraph "Meta-Agent Layer (The Pantheon)"
        Orchestrator[Eternal Loop] --> Security[Security Agent]
        Orchestrator --> Perf[Performance Agent]
        Orchestrator --> Code[Code Refactor Agent]
        Orchestrator --> Biz[Business Agent]
        
        Security -.->|Audit| Backend Core
        Perf -.->|Monitor| Backend Core
        Code -.->|Optimize| Backend Core
        Biz -.->|Analyze| DB
    end
```

## Layers

### 1. Presentation Layer (Frontend)
- **Framework**: React 18 + Vite.
- **State**: Zustand (Global Store).
- **Structure**: Feature-based (`presentation/features`).
- **i18n**: JSON-based translation.

### 2. Application Layer (Backend API)
- **Framework**: Express.js.
- **Pattern**: Controller-Service-Repository.
- **Security**: JWT (Access/Refresh), Helmet, Rate Limiting.
- **Monetization**: Stripe Integration.

### 3. Meta-Agent Layer (New)
- **Location**: `server/agents/`.
- **Purpose**: Autonomous system maintenance and evolution.
- **Agents**:
    - `SecurityAgent`: Vulnerability scanning.
    - `PerformanceAgent`: Metrics and optimization.
    - `CodeRefactorAgent`: Code quality and rewrite.
    - `BusinessAgent`: Revenue optimization.

### 4. Infrastructure
- **Container**: Docker (Multi-stage).
- **Orchestration**: Docker Compose.
- **Database**: PostgreSQL 15.

## Evolution Strategy
The **Eternal Loop** script triggers the Agent Layer periodically to:
1.  **Observe** system metrics.
2.  **Diagnose** issues or inefficiencies.
3.  **Evolve** by proposing code changes or config updates.

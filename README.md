# Drupal CMS AI Builder

An AI-powered onboarding journey and website builder for Drupal CMS. Users answer a 5-minute guided questionnaire and get a fully structured, branded, content-rich website — built on Drupal with full ecosystem extensibility.

Built with **Drupal Canvas**, **Drupal AI Agents**, and an **in-house design system**.

## How This Project Works

This project uses an **agent-driven SDLC** powered by [Claude Code](https://claude.ai/code). Specialized AI agent personas own different phases of the software development lifecycle — from requirements through QA. Each persona is a Claude Code slash command that can be invoked directly.

### The Workflow

```
Vision → PRD → User Stories → Architecture → Technical Backlog
  → Sprint Planning → Development → QA → Bug Fixes → Repeat
```

## Getting Started

### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and configured
- This repository cloned locally

### Starting Point

The product vision is already defined in [`project-management/vision.md`](project-management/vision.md). To begin the SDLC process, run the agent commands in sequence.

## Agent Personas

Each agent is invoked as a Claude Code slash command. They read from and write to the `project-management/` directory structure.

### `/ba` — Business Analyst

Converts the product vision into a structured PRD.

```
/ba Here is my product vision for an AI-powered Drupal website builder...
```

**Reads:** Vision document or user-provided input
**Writes:** `project-management/requirements/prd.md`
**Next step:** `/tpm`

---

### `/tpm` — Technical Project Manager

Two modes of operation:

**Story Creation (default)** — Converts the PRD into user stories with acceptance criteria:
```
/tpm
```

**Sprint Planning** — Groups backlog items into sprints with milestones:
```
/tpm sprint
```

**Reads:** PRD (`requirements/prd.md`) or backlog (`backlog/`)
**Writes:** `requirements/user-stories/` or `sprints/sprint-NN.md`
**Next step:** `/architect` (after stories) or `/dev` (after sprint planning)

---

### `/architect` — Solution Architect

Designs the system architecture based on user stories. Produces ADRs, integration patterns, data flows, and component architecture.

```
/architect
```

**Reads:** User stories from `requirements/user-stories/`
**Writes:** `requirements/architecture/architecture-overview.md`
**Next step:** `/drupal-architect`

---

### `/drupal-architect` — Sr. Drupal Technical Architect

Maps the solution architecture to Drupal-specific patterns (modules, plugins, services, content model) and breaks user stories into granular technical tasks.

```
/drupal-architect
```

**Reads:** Architecture docs + user stories
**Writes:** `requirements/architecture/drupal-technical-design.md` and individual task files in `backlog/task-NNN-slug.md`
**Next step:** `/tpm sprint`

---

### `/dev` — Senior Full-Stack Drupal Engineer

Implements tasks from the backlog. Reads the task definition, checks architecture docs, writes code, and commits.

```
/dev TASK-001
```

Also handles bug fixes reported by QA:
```
/dev BUG-001
```

**Reads:** Task from `backlog/`, sprint from `sprints/`, architecture docs
**Writes:** Source code + `sprint-outputs/`
**Next step:** `/qa sprint-NN`

---

### `/qa` — QA Engineer

Writes and executes Playwright E2E tests against sprint deliverables. Reports bugs with reproduction steps.

```
/qa sprint-01
```

Retest after bug fixes:
```
/qa retest BUG-001
```

**Reads:** Sprint definition + task acceptance criteria
**Writes:** Playwright tests in `tests/` and QA reports in `sprint-outputs/sprint-NN-output.md`
**Next step:** `/dev BUG-NNN` (if bugs found) or `/tpm sprint` (if all pass)

## Recommended Workflow

```bash
# 1. Start Claude Code in the project directory
claude

# 2. Generate PRD from the vision document
/ba Please read project-management/vision.md and create a PRD

# 3. Break PRD into user stories
/tpm

# 4. Define solution architecture
/architect

# 5. Create Drupal-specific technical design and backlog
/drupal-architect

# 6. Plan the first sprint from backlog
/tpm sprint

# 7. Develop sprint tasks
/dev TASK-001

# 8. Run QA after sprint development
/qa sprint-01

# 9. Fix any bugs
/dev BUG-001

# 10. Repeat from step 6 for next sprint
```

## Project Structure

```
.claude/commands/          # Agent persona definitions (slash commands)
project-management/
  vision.md                # Product vision document
  requirements/            # PRD, user stories, architecture docs
    prd.md
    user-stories/
    architecture/
  backlog/                 # Technical tasks (TASK-NNN files)
  sprints/                 # Sprint plans (sprint-NN.md)
  sprint-outputs/          # QA reports, deliverables, bug reports
tests/                     # Playwright E2E tests
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CMS | Drupal (latest) with Drupal Canvas |
| AI | Drupal AI Agents |
| Design System | In-house SDC component library |
| Testing | Playwright |
| Page Building | Drupal Canvas (SDC-based) |
| Hosting | Multi-site (SaaS) + self-hosted options |

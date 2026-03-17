# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered onboarding journey & website builder for Drupal CMS. Leverages Drupal Canvas, Drupal AI Agents, and an in-house design system for visual components.

This is primarily a **planning and project management repo** that will evolve into a full Drupal codebase. The SDLC is agent-driven, with distinct Claude agent personas owning different lifecycle phases.

## Project Structure

```
project-management/
  requirements/    # PRD and product requirements
  backlog/         # Technical tasks broken down from user stories
  sprints/         # Sprint definitions with tasks, plans, dependencies
  sprint-outputs/  # Deliverables and results from completed sprints
```

## Agent Personas & Workflow

The project follows a structured SDLC with specialized agent roles, each invocable as a slash command:

| Command | Persona | Responsibility |
|---------|---------|----------------|
| `/ba` | Business Analyst | Converts vision/ideas into a PRD |
| `/tpm` | Technical Project Manager | PRD → user stories; backlog → sprint planning |
| `/architect` | Solution Architect | System architecture and approach for user stories |
| `/drupal-architect` | Sr. Drupal Technical Architect | Drupal-specific design; stories → technical backlog tasks |
| `/dev` | Senior Full-Stack Drupal Engineer | Implement tasks, commit code, fix bugs |
| `/qa` | QA Engineer | Playwright automation tests, bug reporting |

Command files are in `.claude/commands/`. Each accepts `$ARGUMENTS` for context.

### Workflow Sequence

```
/ba {vision}        → PRD (requirements/)
/tpm                → User Stories (requirements/user-stories/)
/architect          → Architecture (requirements/architecture/)
/drupal-architect   → Technical Tasks (backlog/)
/tpm sprint         → Sprint Plan (sprints/)
/dev TASK-NNN       → Implementation + Commit
/qa sprint-NN       → Playwright Tests + Bug Reports (sprint-outputs/)
/dev BUG-NNN        → Bug Fixes → /qa retest
```

## Sprint Conventions

- Each sprint is a separate markdown file in `sprints/` (e.g., `sprint-01.md`)
- Sprint outputs captured in `sprint-outputs/` (e.g., `sprint-01-output.md`)
- Backlog items in `backlog/` as individual markdown files
- Sprints are organized around milestones representing meaningful deliverables
- Dependencies between backlog items drive sprint composition

## Tech Stack

- **CMS**: Drupal (latest) with Drupal Canvas
- **AI**: Drupal AI Agents (in-platform)
- **Design System**: In-house component library
- **Testing**: Playwright for E2E/automation
- **Architecture**: Headless/decoupled Drupal patterns

## Development Guidelines

- All Drupal code must follow Drupal coding standards
- Use proper Drupal patterns: hooks, plugins, services, dependency injection
- Playwright tests required for all sprint deliverables before marking complete
- Bugs found in QA cycle go back to backlog and get fixed in the same or next sprint

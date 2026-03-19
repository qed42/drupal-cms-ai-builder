# TASK-283: Provisioning Progress — User-Friendly Step Labels & Visibility

**Story:** US-054 (Provisioning Visibility)
**Priority:** P0
**Effort:** M
**Sprint:** Unassigned (candidate for Sprint 15 or 16)

## Description

After content approval, the provisioning pipeline runs 12 steps but the user sees no meaningful progress. Technical step names like "Install Drupal", "Enable modules", "Import config" mean nothing to non-technical users. Need visible, user-friendly progress cards during provisioning.

### Current Steps → Proposed Labels

| # | Internal Step | User-Facing Label |
|---|--------------|-------------------|
| 1 | Create database | Setting up your website's foundation |
| 2 | Generate settings.php | Configuring your site settings |
| 3 | Update sites.php | Registering your website address |
| 4 | Install Drupal CMS | Building your website platform |
| 5 | Install Space DS theme | Applying your design system |
| 6 | Enable modules | Adding website features |
| 7 | Import industry config | Customizing for your industry |
| 8 | Import blueprint | Loading your content and pages |
| 9 | Copy stock images | Adding images to your pages |
| 10 | Apply brand tokens | Applying your brand colors and fonts |
| 11 | Configure site | Final site configuration |
| 12 | Platform callback | Completing setup |

### Implementation Notes

- Provisioning already reports step progress via callback (step 12)
- Need a polling endpoint or websocket for real-time step updates
- Reuse PipelineProgress.tsx card pattern for provisioning steps
- Show estimated time: "Usually takes 2-3 minutes"
- On completion, show summary: "Your website is live at {domain}"

## Acceptance Criteria

- [ ] Each provisioning step shows a user-friendly label (no technical jargon)
- [ ] Progress cards update in real-time as steps complete
- [ ] Elapsed time shown per step
- [ ] Overall progress bar reflects provisioning progress
- [ ] Error states show plain-language explanation

## Dependencies

- TASK-271 (brand identity for consistent styling)
- Partially overlaps with TASK-251 (Step-Level Provisioning Progress UI in Sprint 16)

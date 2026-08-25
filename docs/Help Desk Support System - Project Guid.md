# Help Desk Support System - Project Guide

## 1. Project Overview & Problem Statement

### 1.1 The Current Landscape
Currently, the company lacks a centralized platform to manage support requests. The process relies heavily on uncoordinated channels such as WhatsApp, emails, and word of mouth. As the company grows, this fragmented approach makes it increasingly difficult for the IT department to track, manage, and resolve tickets efficiently.

### 1.2 The Problem
* **No central record:** Requests logged via WhatsApp are invisible to those checking emails, leading to missed, duplicated, or forgotten issues.
* **No ownership tracking:** It is unclear who is currently responsible for resolving specific requests.
* **No status visibility:** Neither support staff, management, nor the requesters can see what is outstanding, in progress, or resolved.
* **Scalability issues:** As headcount grows, this informal, ad-hoc process fails to scale. 
* **Root Cause:** There is no shared system of record only scattered, informal communication.

### 1.3 People Affected
| Stakeholder | Impact |
| :--- | :--- |
| **Employees (Requesters)** | Unable to track issue status; forced to repeatedly follow up via informal channels. |
| **Support Team (Agents)** | Lack full workload visibility; risk of duplicating efforts or dropping unmonitored requests. |
| **Support Team Lead / Manager** | Cannot monitor overall ticket volume, bottlenecks, or team performance without a consolidated record. |
| **Company** | Growing inefficiency, risk of employee frustration, and lost productivity due to unscalable processes. |

### 1.4 Proposed Solution
A centralized support ticketing system that will replace scattered channels with one tracked record. 
* Employees submit issues through a consistent portal instead of varied channels.
* Each request becomes a ticket with a distinct status (e.g., Open, In Progress, Resolved), an assigned owner, and an activity timeline.
* Employees can self-serve to view the status of their tickets.
* Support staff can view, claim, update, and manage incoming tickets centrally.
* Managers gain visibility into ticket volume and team performance.

### 1.5 Success Criteria
* All support requests live in a single unified system.
* Ticket status and ownership are transparent and easily identifiable.
* Employees can self-check their reported issues.
* Duplication of work and lost requests are eliminated for the support team.
* The process scales robustly with company headcount growth.
* A historical record of all requests is maintained for accountability and pattern recognition.

## 2. Stakeholders and Users

| Role | Goal | Main Actions |
| :--- | :--- | :--- |
| **Employee (Requester)** | Get their issue resolved and track its progress. | Submit new requests; view/comment on their own requests. |
| **Support Team Member (Agent)** | Manage workload efficiently; avoid duplicated/dropped work. | View all requests; claim/update status; add internal notes; resolve requests. |
| **Support Team Lead / Manager** | Oversee support function; ensure smooth team operations and system configuration. | Everything an Agent can do, plus reassign requests, view reports, manage accounts, and configure settings. |

## 3. Requirements

### 3.1 Functional Requirements

#### Employee (Requester)
* **FR1 — Submit a support request:** Authenticated employees can submit a new request (Title, description, category, optional attachments). System creates a ticket with "Open" status, unique ID, and timestamp. System validates required fields.
* **FR2 — View own requests:** Employees can view a list of all personally submitted requests and their statuses.
* **FR3 — View request detail and history:** Employees can view full details, updates, and agent comments on their own requests. System prevents access to other users' requests.
* **FR4 — Comment on own request:** Employees can add follow-up comments/info to their open requests.

#### Support Team Member (Agent)
* **FR5 — View all requests:** Authorized agents can view all submitted requests, statuses, categories, and submitters.
* **FR6 — Claim / be assigned a request:** Agents can claim unassigned requests (updating status to "In Progress"). System prevents double-claiming.
* **FR7 — Update request status:** Agents can update the status of owned requests (e.g., In Progress, Waiting on Employee, Resolved).
* **FR8 — Add internal notes:** Agents can add staff-only internal notes to a request.
* **FR9 — Respond to employee:** Agents can add comments visible to the submitting employee.
* **FR10 — Resolve a request:** Agents can mark requests as "Resolved," recording resolution time and notifying the employee.

#### Support Team Lead / Manager
* **FR11 — Reassign requests:** Managers can reassign requests between agents.
* **FR12 — View team-wide reports:** Display summary reporting (total open/in-progress/resolved, requests per agent).
* **FR13 — View all requests and full history:** Managers can view any request, including internal notes and full history.
* **FR14 — Manage user accounts:** Managers can create, deactivate, modify accounts, and assign roles (preventing duplicate emails).
* **FR15 — Configure system settings:** Managers can manage request categories and system configurations.

#### All users
* **FR16 — Authentication:** All users must log in before accessing the system.
* **FR17 — Notifications:** Notify employees on status changes or agent responses (in-app minimum).

### 3.2 Non-Functional Requirements
* **Security:** Role-based access control (RBAC). Employees only see their own requests; internal notes are restricted to support staff.
* **Data Validation:** Validate required fields upon submission; provide clear rejection messages.
* **Error Handling:** Provide meaningful, specific feedback on failed actions (e.g., double-claim prevention).
* **Reliability:** No silent data loss. Every submitted request must be retrievable and auditable.
* **Usability:** Intuitive interface requiring zero technical training for employees.
* **Responsiveness:** Fully usable on desktop and mobile screens.
* **Performance:** Request lists and dashboards must load within a few seconds under normal usage.
* **Accessibility:** Follow basic accessibility practices (contrast, keyboard navigation, clear labels).

### 3.3 Assumptions
* The system replaces WhatsApp/email/verbal reporting rather than integrating with them.
* All employees will have an account (created by admin or via SSO) and must log in.
* This is an internal support system (not customer-facing).
* Notifications will be delivered in-app at a minimum.

## 4. User Stories & Acceptance Criteria

### Employee (Requester)

**US1 — Submit a request**
> **As an** employee, **I want** to submit a support request describing my issue, **so that** the support team can help me resolve it.
* *AC1:* **Given** an employee is logged in and on the "New Request" form, **When** they fill in a title, description, category, and submit, **Then** a new ticket is created with status "Open," a unique reference number, and a timestamp, and the employee sees a confirmation.
* *AC2:* **Given** an employee is filling in the form, **When** they submit without completing a required field, **Then** the system rejects the submission, highlights the missing field, and preserves entered info.

**US2 — View my requests**
> **As an** employee, **I want** to see a list of all requests I've submitted with their status, **so that** I know what's outstanding.
* *AC1:* **Given** an employee is logged in, **When** they open their "My Requests" list, **Then** they see every request they've submitted with its current status.

**US3 — View request detail**
> **As an** employee, **I want** to view the full detail and history of my request, **so that** I can see updates from support.
* *AC1:* **Given** an employee views their own request, **When** they open it, **Then** they see the description, status, and comments (excluding internal notes).
* *AC2:* **Given** an employee attempts to open someone else's request, **When** they try to access it, **Then** the system denies access and does not reveal if the request exists.

**US4 — Add follow-up information**
> **As an** employee, **I want** to add a comment to my open request, **so that** I can provide extra info.
* *AC1:* **Given** an employee views their own open request, **When** they submit a comment, **Then** it is added to history and visible to the agent.
* *AC2:* **Given** a request is "Resolved", **When** the employee tries to comment, **Then** the system prevents new comments or reopens the ticket and notifies the agent.

### Support Team Member (Agent)

**US5 — View all incoming requests**
> **As a** support agent, **I want** to see all submitted requests and statuses, **so that** I identify what needs attention.
* *AC1:* **Given** an agent is logged in, **When** they open the queue, **Then** they see every request, including unassigned ones.

**US6 — Claim a request**
> **As a** support agent, **I want** to claim an unassigned request, **so that** I take ownership of it.
* *AC1:* **Given** an agent views an unassigned request, **When** they click "Claim", **Then** the request is assigned to them and status changes to "In Progress".
* *AC2:* **Given** two agents view the same request, **When** both attempt to claim it, **Then** only the first succeeds; the second receives an "already assigned" message.

**US7 — Update request status**
> **As a** support agent, **I want** to update the status of a request I own, **so that** progress is reflected.
* *AC1:* **Given** an agent owns a request, **When** they change its status, **Then** the new status is saved and visible to the employee/manager.
* *AC2:* **Given** an agent tries to update an unowned request, **When** they attempt it, **Then** the system prevents the update.

**US8 — Add internal notes**
> **As a** support agent, **I want** to add internal notes, **so that** I can record context without exposing it to the employee.
* *AC1:* **Given** an agent views an owned request, **When** they add an internal note, **Then** it is saved and visible only to staff.

**US9 — Respond to the employee**
> **As a** support agent, **I want** to send a response to the employee, **so that** they are kept informed.
* *AC1:* **Given** an agent owns a request, **When** they submit a response, **Then** it is added and the employee is notified.

**US10 — Resolve a request**
> **As a** support agent, **I want** to mark a request as resolved, **so that** the ticket reflects completion.
* *AC1:* **Given** an agent owns an in-progress request, **When** they mark it "Resolved", **Then** the status changes, a timestamp is recorded, and the employee is notified.
* *AC2:* **Given** an agent attempts to resolve an unowned request, **When** they try, **Then** the system prevents the action.

### Support Team Lead / Manager

**US11 — Reassign a request**
> **As a** manager, **I want** to reassign a request, **so that** workload stays balanced.
* *AC1:* **Given** a manager views any request, **When** they select a different agent, **Then** the owner updates, history logs it, and both agents are notified.

**US12 — View team reports**
> **As a** manager, **I want** to see summary statistics, **so that** I can spot bottlenecks.
* *AC1:* **Given** a manager opens reporting, **When** it loads, **Then** it displays counts (open/in-progress/resolved) and a breakdown per agent.

**US13 — Manage user accounts**
> **As a** manager, **I want** to manage user accounts, **so that** the right people have proper access.
* *AC1:* **Given** a manager is on user management, **When** they create an account and assign a role, **Then** the account is created with appropriate permissions.
* *AC2:* **Given** a manager attempts to create an account with an existing email, **When** they submit, **Then** the system rejects and explains why.

**US14 — Configure system settings**
> **As a** manager, **I want** to manage request categories, **so that** they reflect company organization.
* *AC1:* **Given** a manager is on settings, **When** they modify a category, **Then** the change saves and reflects in the "New Request" form immediately.

### All users

**US15 — Authentication**
> **As any** user, **I want** to log in securely, **so that** only I access my account and data.
* *AC1:* **Given** a user enters valid credentials, **When** they submit, **Then** they are authenticated and taken to their role's view.
* *AC2:* **Given** a user enters invalid credentials, **When** they submit, **Then** the system rejects the attempt and shows a generic error.
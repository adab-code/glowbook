# Feature Specification: GlowBook Booking & Client Management

**Feature Branch**: `001-glowbook-booking`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "Create a project specification for GlowBook, a booking and client management app for independent beauty professionals and small studios (lash technicians, hairstylists, nail artists, and similar businesses). Include: a project title and description, the purpose and target audience, user stories for core workflows (owner/staff sign up, sign in, sign out, create, read, update, delete clients, services, and appointments, and a daily dashboard), acceptance criteria for each story, API endpoints, and implementation priority."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Account Access Owner/Staff (Priority: P1)

A business owner signs up with a studio name, email, and password, signs in to manage the studio's private data, and signs out when finished. An owner can optionally invite staff members, who sign in with their own credentials to see the shared schedule.

**Why this priority**: Everything else (clients, services, appointments) is private per studio, so authentication and tenant isolation are the foundation; without it no other story can be safely demonstrated.

**Independent Test**: Can be fully tested by creating an account, signing in with valid and invalid credentials, confirming duplicate emails are rejected, and signing out.

**Acceptance Scenarios**:

1. **Given** a new visitor on the sign-up page, **When** they submit a valid studio name, email, and password, **Then** an account is created and they are signed in to a new, empty workspace.
2. **Given** a sign-up attempt with an already-registered email, **When** they submit, **Then** the system rejects it with a clear "account already exists" message without exposing further details.
3. **Given** a registered owner or staff member, **When** they enter correct email and password, **Then** they are signed in and taken to the daily dashboard.
4. **Given** a registered user, **When** they enter an incorrect password, **Then** they see a generic "invalid email or password" message and are not signed in.
5. **Given** a signed-in owner, **When** they invite a staff member by email, **Then** that person can create staff credentials tied to the same studio workspace.
6. **Given** a signed-in user, **When** they sign out, **Then** their session ends, they return to the sign-in page, and they cannot view studio data until they sign in again.

---

### User Story 2 - Service & Client Catalogs (Priority: P1)

A signed-in user maintains two catalogs: the services the studio offers (name, price, estimated duration) and the clients they serve (contact info, notes such as allergies and preferences, and appointment history). Both support create, read, update, and delete.

**Why this priority**: Appointments must reference existing clients and services; these catalogs are the data prerequisites for booking and are independently demonstrable.

**Independent Test**: Can be fully tested by creating, editing, and deleting services and clients, observing validation errors on missing required fields, and confirming delete warnings when records have upcoming appointments.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they submit a service with name, price, and duration, **Then** it is saved and appears in the catalog.
2. **Given** an existing service no longer offered, **When** the user edits or deletes it, **Then** edits reflect everywhere and deletion is confirmed before proceeding when appointments reference it.
3. **Given** a signed-in user, **When** they create a client with name and contact information, **Then** the client is saved and appears in the list.
4. **Given** an existing client, **When** the user opens their profile, **Then** they see contact info, notes, and past and upcoming appointments.
5. **Given** a client with associated appointments, **When** the user attempts to delete them, **Then** the system warns that related appointments exist and asks for confirmation.
6. **Given** a submission missing a required field (service or client), **When** the user saves, **Then** the system shows a validation error and does not save.

---

### User Story 3 - Appointment Calendar (Priority: P1)

A signed-in user creates, views, edits, and cancels appointments in a calendar view, linking each appointment to a client and one or more services, so the schedule stays accurate and double bookings are avoided.

**Why this priority**: Booking appointments is the core day-to-day value of the product and the main reason a studio would adopt GlowBook.

**Independent Test**: Can be fully tested by booking against an existing client and service, editing and cancelling a booking, and attempting an overlapping time slot.

**Acceptance Scenarios**:

1. **Given** a signed-in user with at least one client and one service, **When** they book an appointment with client, service, date, and time, **Then** it is saved and appears on the calendar and the client's profile.
2. **Given** an existing appointment, **When** the user opens its detail view, **Then** they see client, service(s), date, time, duration, and status.
3. **Given** an already-booked, non-cancelled time slot, **When** the user tries to book or move another appointment into it, **Then** the system warns of the conflict before confirming.
4. **Given** an existing appointment that cannot take place, **When** the user cancels it, **Then** its status changes to "Cancelled" and the slot becomes available again.
5. **Given** a booking attempt without a client, service, date, or time, **When** the user saves, **Then** the system shows a validation error and does not save.
6. **Given** a signed-in user on the calendar, **When** they filter by status or by staff member, **Then** only matching appointments are shown.

---

### User Story 4 - Daily Dashboard (Priority: P2)

A signed-in user opens the dashboard to see today's appointments in chronological order and a preview of upcoming days, without searching the full calendar, and can update a status directly from it.

**Why this priority**: Adds daily efficiency on top of the calendar; valuable but not blocking for an MVP.

**Independent Test**: Can be fully tested by viewing a day with and without appointments (empty state) and marking an appointment Completed/No-show from the dashboard.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they open the dashboard, **Then** they see today's appointments chronologically with client name, service, and time.
2. **Given** a day with no appointments, **When** they view the dashboard, **Then** a clear empty-state message is shown.
3. **Given** an appointment listed on the dashboard, **When** they mark it Completed or No-show, **Then** its status updates on the calendar and client profile too.

### Edge Cases

- Invalid or malformed email at sign-up → rejected with a clear validation message.
- Forgotten password → self-service, time-limited email reset flow.
- Client or service deletion referenced by appointments → blocked or requires explicit confirmation, never orphaning appointments.
- Two bookings at the same time slot → overlap detected and warned before saving.
- Session expires mid-edit → prompt re-authentication; do not silently discard data where feasible.
- Concurrent edits from two sessions of the same studio → last write wins, timestamp reflects the most recent save.
- Appointment set in the past → warn the user, but allow it for logging historical appointments.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a new user to sign up with a studio name, email, and password.
- **FR-002**: System MUST reject duplicate account emails with a clear message.
- **FR-003**: System MUST allow registered users to sign in and out, ending the session.
- **FR-004**: System MUST provide a secure, time-limited password-reset flow via email.
- **FR-005**: System MUST isolate each studio's data and allow invited staff to access the same workspace.
- **FR-006**: System MUST allow signed-in users to create, view, update, and delete services (name, price, duration), warning before deleting a service with upcoming appointments.
- **FR-007**: System MUST allow signed-in users to create, view, update, and delete client profiles (contact info, notes, appointment history), warning before deleting a client with appointments.
- **FR-008**: System MUST validate required fields for all service, client, and appointment writes before saving.
- **FR-009**: System MUST allow signed-in users to create, view, edit, and cancel appointments linked to a client and one or more services.
- **FR-010**: System MUST warn when a new or edited appointment overlaps a non-cancelled appointment.
- **FR-011**: System MUST classify appointments with statuses (default "Scheduled"; supports Completed, Cancelled, No-show) and allow filtering by status and staff member.
- **FR-012**: System MUST show today's appointments chronologically on a dashboard, preview upcoming days, display an empty state, and allow status updates from the dashboard.

### Key Entities *(include if feature involves data)*

- **Account (Studio)**: The registered beauty business; owns all staff, clients, services, and appointments; credentials for sign-in.
- **Staff User**: An individual signed-in user tied to an Account; the owner or an invited staff member.
- **Client**: A person the studio serves; contact information, notes (allergies, preferences), linked to multiple appointments.
- **Service**: A studio offering; name, price, estimated duration; linked to multiple appointments.
- **Appointment**: A scheduled booking; a client, one or more services, date/time, and status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new owner can create an account and reach an empty workspace in under 2 minutes on first attempt.
- **SC-002**: A signed-in user can create, edit, and delete a service or client without errors once validation messages are understood.
- **SC-003**: A user can book an appointment referencing a client and service in under 1 minute.
- **SC-004**: 100% of attempted overlapping non-cancelled bookings are detected and warned before saving.
- **SC-005**: A user can confirm an appointment's current status (Scheduled, Completed, Cancelled, No-show) from both the calendar and the dashboard.
- **SC-006**: Studio data is never visible to a different studio's account.
- **SC-007**: All forms show clear validation or error feedback on invalid submissions.
- **SC-008**: The dashboard always shows either today's appointments or a clear empty state, never a blank page.

## Assumptions

- Users have stable internet connectivity and use current browsers (the app is a responsive web app; native mobile apps are out of scope for v1).
- A studio has one or very few staff members; large multi-branch enterprise scheduling is out of scope.
- Appointment durations equal the sum of the linked services' estimated durations.
- Authentication uses a standard email/password flow (course default: Auth.js/NextAuth or Clerk).
- Single timezone per studio; timezone handling across studios is deferred to Phase 2.
- Delete of a client or service always requires confirmation when related appointments exist; hard delete of a client soft-hides the record to preserve history in Phase 2.
- Notification/reminders to clients by email/SMS are Phase 2, out of MVP scope.
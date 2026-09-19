# Feature Specification: GlowBook

**Feature Branch**: `001-glowbook`
**Created**: 2026-09-17
**Status**: Draft

**Input**: User description: "Create a project specification for GlowBook, a booking and client management app for independent beauty professionals and small studios (lash technicians, hairstylists, nail artists, and similar businesses). Include: a project title and description, the purpose and target audience, user stories for core workflows (owner/staff sign up, sign in, sign out, create, read, update, delete clients, services, and appointments, and a daily dashboard), acceptance criteria for each story, API endpoints, and implementation priority."

## Overview

**GlowBook** is a booking and client management web application built for independent beauty professionals and small studios — lash technicians, hairstylists, nail artists, and similar microbusinesses.

Instead of juggling appointments through WhatsApp and Instagram direct messages, or tracking client details in a paper notebook, GlowBook gives beauty professionals one place to schedule appointments, keep client history and notes, and manage the services they offer.

**Purpose**: to give independent beauty professionals a lightweight system for organizing appointments, client relationships, and service offerings — cutting down on double bookings and forgotten client details — without the overhead of an enterprise scheduling or CRM platform.

**Target Audience**: GlowBook is intended for beauty microbusinesses such as:

- Independent lash technicians
- Hairstylists and hair salons with a small team
- Nail artists
- Estheticians and small beauty studios
- Other solo or small-team beauty service providers

The MVP focuses on the workflows a single studio needs day to day: booking appointments, remembering clients, and knowing what's on the schedule.

## User Scenarios & Testing

### User Story 1 - Owner/Staff Account Access (Priority: P1)

A business owner signs up for a GlowBook account, signs in to manage their studio's data, and signs out when finished, so that appointments and client information stay private to their business. An owner can optionally invite staff members, who sign in with their own credentials to see the shared schedule.

**Acceptance Scenarios:**

1. **Given** a new visitor on the sign-up page, **When** they submit a valid business/studio name, email address, and password, **Then** an account is created and they are signed in to a new, empty workspace.
2. **Given** a visitor submits a sign-up form with an email address already registered, **When** they submit, **Then** the system rejects the submission and shows a clear "account already exists" message without exposing further account details.
3. **Given** a registered owner or staff member on the sign-in page, **When** they enter the correct email and password, **Then** they are signed in and taken to the daily dashboard.
4. **Given** a registered user on the sign-in page, **When** they enter an incorrect password, **Then** they see a generic "invalid email or password" message and are not signed in.
5. **Given** a signed-in owner, **When** they invite a staff member by email, **Then** that person can create staff-level credentials tied to the same studio workspace.
6. **Given** a signed-in user, **When** they choose "sign out," **Then** their session ends and they are returned to the sign-in page, unable to view studio data until they sign in again.

### User Story 2 - Service Catalog (Priority: P1)

A signed-in user creates and maintains a catalog of the services their studio offers, so that each service has a consistent name, price, and estimated duration to use when booking appointments.

**Acceptance Scenarios:**

1. **Given** a signed-in user on the services page, **When** they submit a new service with a name, price, and estimated duration, **Then** the service is saved and appears in the service catalog.
2. **Given** an existing service, **When** the user edits its name, price, or duration, **Then** the updated details are reflected wherever the service is shown, including on future appointment forms.
3. **Given** an existing service with no appointments referencing it, **When** the user deletes it, **Then** it no longer appears in the catalog or in the service picker when booking.
4. **Given** an existing service with one or more upcoming appointments, **When** the user attempts to delete it, **Then** the system warns them and asks for confirmation before proceeding.
5. **Given** a user submits a service without a name, price, or duration, **When** they attempt to save, **Then** the system shows a validation error and does not save the record.

### User Story 3 - Client Profiles (Priority: P1)

A signed-in user creates, views, updates, and deletes client profiles, so that they keep an accurate record of who they work with, including contact info, preferences, allergies, and past services.

**Acceptance Scenarios:**

1. **Given** a signed-in user on the clients page, **When** they submit a new client's name and contact information, **Then** the client is saved and appears in the client list.
2. **Given** an existing client, **When** the user opens the client's profile, **Then** they see contact information, notes (e.g., allergies, preferences), and a history of past and upcoming appointments.
3. **Given** an existing client, **When** the user edits and saves changes to the profile (including notes), **Then** the updated information is reflected immediately in the list and profile views.
4. **Given** an existing client with no appointments, **When** the user deletes the client, **Then** the client no longer appears in the client list.
5. **Given** an existing client with one or more appointments, **When** the user attempts to delete the client, **Then** the system warns them that related appointments exist and asks for confirmation before proceeding.
6. **Given** a user submits a new or edited client without a required field (e.g., name), **When** they attempt to save, **Then** the system shows a validation error and does not save the record.

### User Story 4 - Appointment Calendar (Priority: P1)

A signed-in user creates, views, edits, and cancels appointments in a calendar view, linking each appointment to a client and one or more services, so that the studio's schedule stays accurate and double bookings are avoided.

**Acceptance Scenarios:**

1. **Given** a signed-in user with at least one client and one service, **When** they create a new appointment with a client, service, date, and time, **Then** the appointment is saved and appears on the calendar and on the client's profile.
2. **Given** an existing appointment, **When** the user opens its detail view, **Then** they see the client, service(s), date, time, estimated duration, and current status.
3. **Given** an existing appointment, **When** the user edits its date, time, client, or service, **Then** the updated details are reflected immediately on the calendar.
4. **Given** an existing appointment, **When** the user cancels it, **Then** its status changes to "Cancelled" and the time slot becomes available again on the calendar.
5. **Given** a user attempts to create an appointment for a time slot that overlaps an existing, non-cancelled appointment, **Then** the system warns them of the conflict before allowing them to confirm.
6. **Given** a user attempts to create an appointment without selecting a client, service, date, or time, **When** they attempt to save, **Then** the system shows a validation error and does not save the record.
7. **Given** a signed-in user on the calendar, **When** they filter by staff member (if staff exist) or by status, **Then** only matching appointments are displayed.

### User Story 5 - Daily Dashboard (Priority: P2)

A signed-in user opens the dashboard, so that they can see, at a glance, today's appointments and what's coming up next, without searching through the full calendar.

**Acceptance Scenarios:**

1. **Given** a signed-in user, **When** they open the dashboard, **Then** they see a list of today's appointments in chronological order, including client name, service, and time.
2. **Given** a signed-in user, **When** they view the dashboard, **Then** they also see a short preview of upcoming appointments for the next few days.
3. **Given** a day with no appointments, **When** the user views the dashboard, **Then** the system displays a clear empty-state message instead of a blank list.
4. **Given** an appointment listed on the dashboard, **When** the user marks it "Completed" or "No-show" directly from the dashboard, **Then** its status updates and is reflected on the calendar and client profile.

### Edge Cases

- What happens when a user tries to sign up with an invalid or malformed email address? System must reject with a clear validation message.
- What happens when a user forgets their password? System must provide a self-service password reset flow via email.
- How does the system handle a client or service deletion that is referenced by an appointment? Deletion must be blocked or require explicit confirmation to prevent orphaned appointments.
- What happens when two appointments are booked for the same time slot? System must detect the overlap and warn the user before saving.
- What happens when a user's session expires while editing a record? System must prompt re-authentication without silently discarding unsaved data where feasible.
- How does the system handle concurrent edits to the same client or appointment from two sessions of the same studio account? Last write wins, with the record's updated timestamp reflecting the most recent save.
- What happens when an appointment date/time is set in the past? System should warn the user, though it may still allow it for logging historical appointments.

## Requirements

### Functional Requirements

**Account access**
- **FR-001**: System MUST allow a new user to sign up with a business/studio name, email address, and password.
- **FR-002**: System MUST prevent duplicate accounts from being created with the same email address.
- **FR-003**: System MUST allow a registered user to sign in with their email and password.
- **FR-004**: System MUST allow a signed-in user to sign out, ending their session.
- **FR-005**: System MUST allow a user to reset a forgotten password via a secure, time-limited reset link sent to their registered email.
- **FR-006**: System MUST keep each studio's data (clients, services, appointments) isolated and accessible only to that studio's authenticated account and its invited staff.
- **FR-007**: System MUST allow a studio owner to invite staff members who can sign in with their own credentials under the same studio workspace.

**Service catalog**
- **FR-008**: System MUST allow a signed-in user to create a service with a name, price, and estimated duration.
- **FR-009**: System MUST allow a signed-in user to view, update, and delete services, warning them first if a service has upcoming appointments.
- **FR-010**: System MUST validate required service fields before saving.

**Client management**
- **FR-011**: System MUST allow a signed-in user to create a client record with, at minimum, a name and contact information.
- **FR-012**: System MUST allow a signed-in user to store free-form notes on a client (e.g., allergies, preferences).
- **FR-013**: System MUST allow a signed-in user to view a list of clients and the details of any individual client, including their appointment history.
- **FR-014**: System MUST allow a signed-in user to update an existing client's details and notes.
- **FR-015**: System MUST allow a signed-in user to delete a client, warning them first if the client has associated appointments.
- **FR-016**: System MUST validate required client fields before saving.

**Appointment calendar**
- **FR-017**: System MUST allow a signed-in user to create an appointment linked to an existing client and at least one service, with a date and time.
- **FR-018**: System MUST allow a signed-in user to view appointments in a calendar view and as a list.
- **FR-019**: System MUST allow a signed-in user to update an existing appointment's date, time, client, or service(s).
- **FR-020**: System MUST allow a signed-in user to cancel an appointment without deleting its record.
- **FR-021**: System MUST warn the user when a new or edited appointment overlaps an existing, non-cancelled appointment.
- **FR-022**: System MUST validate required appointment fields (client, service, date, time) before saving.
- **FR-023**: System MUST allow a signed-in user to filter appointments by status and, where staff exist, by staff member.
- **FR-024**: System MUST assign every new appointment a default status of "Scheduled" and support additional statuses (e.g., Completed, Cancelled, No-show).

**Daily dashboard**
- **FR-025**: System MUST display a dashboard showing the signed-in user's appointments for the current day in chronological order.
- **FR-026**: System MUST display a short preview of upcoming appointments beyond the current day.
- **FR-027**: System MUST allow a signed-in user to update an appointment's status directly from the dashboard.

### Key Entities

- **Account (Studio)**: Represents a registered beauty business with credentials for sign-in; owns all staff, clients, services, and appointments created under it.
- **Staff User**: An individual signed-in user tied to an Account; may be the owner or an invited staff member.
- **Client**: Represents a person the studio serves; includes name, contact information, and notes (e.g., allergies, preferences); can have multiple appointments.
- **Service**: Represents an offering the studio provides; includes name, price, and estimated duration; can be linked to multiple appointments.
- **Appointment**: Represents a scheduled booking; includes a client, one or more services, date, time, and current status (Scheduled, Completed, Cancelled, No-show).

## Reference: Illustrative API Endpoints

*(Non-binding reference for planning purposes; not a contract for implementation technology.)*

| Capability | Method | Endpoint |
|---|---|---|
| Sign up | POST | `/api/auth/signup` |
| Sign in | POST | `/api/auth/signin` |
| Sign out | POST | `/api/auth/signout` |
| Request password reset | POST | `/api/auth/password-reset` |
| Invite staff member | POST | `/api/staff/invite` |
| List services | GET | `/api/services` |
| Create service | POST | `/api/services` |
| Get service | GET | `/api/services/{id}` |
| Update service | PUT/PATCH | `/api/services/{id}` |
| Delete service | DELETE | `/api/services/{id}` |
| List clients | GET | `/api/clients` |
| Create client | POST | `/api/clients` |
| Get client | GET | `/api/clients/{id}` |
| Update client | PUT/PATCH | `/api/clients/{id}` |
| Delete client | DELETE | `/api/clients/{id}` |
| List appointments | GET | `/api/appointments` |
| Create appointment | POST | `/api/appointments` |
| Get appointment | GET | `/api/appointments/{id}` |
| Update appointment | PUT/PATCH | `/api/appointments/{id}` |
| Update appointment status | PATCH | `/api/appointments/{id}/status` |
| Cancel appointment | PATCH | `/api/appointments/{id}/cancel` |
| Delete appointment | DELETE | `/api/appointments/{id}` |
| Get today's dashboard | GET | `/api/dashboard/today` |

## Implementation Priority

1. **P1 — Owner/Staff Account Access**: Foundation for all other functionality; must exist first.
2. **P1 — Service Catalog**: Needed before appointments can reference a service.
3. **P1 — Client Profiles**: Needed before appointments can be booked.
4. **P1 — Appointment Calendar**: Core day-to-day value; depends on clients and services.
5. **P2 — Daily Dashboard**: Builds on the calendar to surface today's and upcoming appointments at a glance.

## Success Criteria

### Measurable Outcomes

GlowBook will be considered successful when users can complete the core business workflows:

1. **SC-001**: Create and authenticate an owner account, and invite staff where applicable.
2. **SC-002**: Create, view, update, and delete services in the catalog.
3. **SC-003**: Create, view, update, and delete client profiles, including notes.
4. **SC-004**: Book, view, edit, and cancel appointments without double-booking a time slot.
5. **SC-005**: Track appointment status from Scheduled through Completed, Cancelled, or No-show.
6. **SC-006**: View today's and upcoming appointments through the dashboard.
7. **SC-007**: Access only their own studio's data.
8. **SC-008**: Receive appropriate validation and error responses across all forms.

The application should stay focused on booking, client management, and the service catalog, without expanding into a full accounting, marketing, or enterprise CRM platform.
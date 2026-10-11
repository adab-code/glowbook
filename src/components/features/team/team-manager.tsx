"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";
import { fullName } from "@/lib/utils/format";

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "OWNER" | "STAFF";
};

export type TeamInvitation = {
  id: string;
  email: string;
  role: "OWNER" | "STAFF";
  expiresAt: string;
  createdAt: string;
};

export function TeamManager({
  initialMembers,
  initialInvitations,
  canInvite,
}: {
  initialMembers: TeamMember[];
  /** Always [] for STAFF: listing invitations is owner-only. */
  initialInvitations: TeamInvitation[];
  /** False for STAFF: inviting and revoking are owner-only. */
  canInvite: boolean;
}) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "STAFF">("STAFF");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [reloading, startReload] = useTransition();

  async function reload() {
    startReload(async () => {
      try {
        const result = await apiFetch<{ data: TeamInvitation[] }>(
          "/api/staff/invitations",
        );
        setInvitations(result.data);
      } catch (error) {
        setMessage(toMessage(error));
      }
    });
  }

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setMessage(null);
    setAcceptUrl(null);
    try {
      const result = await apiFetch<{
        data: TeamInvitation;
        acceptUrl: string;
      }>("/api/staff/invitations", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setAcceptUrl(result.acceptUrl);
      setMessage(`Invitation created for ${result.data.email}.`);
      setEmail("");
      setRole("STAFF");
      await reload();
    } catch (error) {
      setFieldErrors(toFieldErrors(error));
      if (Object.keys(toFieldErrors(error)).length === 0) {
        setMessage(toMessage(error));
      }
    }
  }

  async function handleRevoke(invitation: TeamInvitation) {
    await apiFetch(`/api/staff/invitations/${invitation.id}`, {
      method: "DELETE",
    });
    setMessage(`Invitation for ${invitation.email} was revoked.`);
    await reload();
  }

  async function copyLink() {
    if (!acceptUrl) return;
    try {
      await navigator.clipboard.writeText(acceptUrl);
      setMessage("Invitation link copied to the clipboard.");
    } catch {
      setMessage("Copy this link manually — the clipboard was unavailable.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p
          role="status"
          className="rounded-[var(--radius-control)] bg-info-bg px-3 py-2 text-sm text-info"
        >
          {message}
        </p>
      ) : null}

      {canInvite ? (
        <>
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Invite someone
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Owners only. There is no mail provider, so copy the invitation
                  link after creating it and send it yourself.
                </p>
              </div>
              <form onSubmit={handleInvite} className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
                  <FormField label="Email" error={fieldErrors.email}>
                    {({ id, invalid, describedBy }) => (
                      <Input
                        id={id}
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="teammate@studio.com"
                        autoComplete="email"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                      />
                    )}
                  </FormField>
                  <FormField label="Role" error={fieldErrors.role}>
                    {({ id, invalid, describedBy }) => (
                      <select
                        id={id}
                        value={role}
                        onChange={(event) =>
                          setRole(
                            event.target.value === "OWNER" ? "OWNER" : "STAFF",
                          )
                        }
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className="h-11 w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-sm focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none"
                      >
                        <option value="STAFF">Staff</option>
                        <option value="OWNER">Owner</option>
                      </select>
                    )}
                  </FormField>
                  <Button type="submit">Send invite</Button>
                </div>
              </form>
              {acceptUrl ? (
                <div className="rounded-[var(--radius-control)] bg-success-bg px-3 py-2">
                  <p className="text-sm font-medium text-success">
                    Share this link — it expires in 7 days and works once:
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 truncate rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800">
                      {acceptUrl}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyLink}
                    >
                      Copy link
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 sm:p-0">
              {invitations.length === 0 ? (
                <EmptyState
                  title="No pending invitations"
                  description="Invite someone above and the pending link shows up here until they join."
                  icon="✉"
                />
              ) : (
                <ul className="divide-y divide-neutral-200">
                  {invitations.map((invitation) => (
                    <li
                      key={invitation.id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-neutral-900">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Invited as{" "}
                          {invitation.role === "OWNER" ? "owner" : "staff"}
                          {" · "}expires{" "}
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <ConfirmDialog
                          trigger={
                            <Button variant="danger" size="sm">
                              Revoke
                            </Button>
                          }
                          title={`Revoke the invitation for ${invitation.email}?`}
                          description="They will no longer be able to join with that link. You can invite them again any time."
                          confirmLabel="Revoke invitation"
                          onConfirm={() => handleRevoke(invitation)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      <div>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">
          Team members
        </h2>
        <Card>
          <CardContent className="p-0 sm:p-0">
            <ul className="divide-y divide-neutral-200">
              {initialMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <p className="font-medium text-neutral-900">
                    {fullName(member)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {member.email} ·{" "}
                    {member.role === "OWNER" ? "owner" : "staff"}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {reloading ? (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Spinner /> Refreshing invitations…
        </p>
      ) : null}
    </div>
  );
}

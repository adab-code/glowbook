"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { ClientForm } from "@/components/features/clients/client-form";
import { apiFetch, toMessage } from "@/lib/utils/api-client";
import { fullName } from "@/lib/utils/format";
import type { Client } from "@/generated/prisma/client";

type ClientWithCount = Client & {
  _count: { appointments: number };
};

export function ClientManager({
  initialClients,
}: {
  initialClients: ClientWithCount[];
}) {
  const [clients, setClients] = useState(initialClients);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClientWithCount | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [reloading, startReload] = useTransition();

  async function reload() {
    startReload(async () => {
      try {
        const result = await apiFetch<{ data: ClientWithCount[] }>(
          "/api/clients",
        );
        setClients(result.data);
      } catch (error) {
        setMessage(toMessage(error));
      }
    });
  }

  async function handleArchive(client: ClientWithCount) {
    const result = await apiFetch<{ meta?: { message?: string } }>(
      `/api/clients/${client.id}`,
      { method: "DELETE" },
    );
    setMessage(result.meta?.message ?? `${fullName(client)} was archived.`);
    await reload();
  }

  const visible = filter
    ? clients.filter((client) =>
        `${client.firstName} ${client.lastName} ${client.email ?? ""} ${client.phone ?? ""}`
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : clients;

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

      {creating || editing ? (
        <ClientForm
          key={editing?.id ?? "new"}
          initial={
            editing
              ? {
                  id: editing.id,
                  firstName: editing.firstName,
                  lastName: editing.lastName,
                  email: editing.email ?? "",
                  phone: editing.phone ?? "",
                  notes: editing.notes ?? "",
                }
              : undefined
          }
          onDone={() => {
            setCreating(false);
            setEditing(null);
            void reload();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-xs">
            <label
              htmlFor="client-filter"
              className="mb-1.5 block text-[13px] font-medium text-neutral-800"
            >
              Search clients
            </label>
            <input
              id="client-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Name, email or phone"
              className="h-11 w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-sm focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none"
            />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            Add client
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 sm:p-0">
          {visible.length === 0 ? (
            <EmptyState
              title={filter ? "No clients match that search" : "No clients yet"}
              description={
                filter
                  ? "Try a different name, email or phone number."
                  : "Add your first client to start booking appointments for them."
              }
              action={
                filter ? null : (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setCreating(true);
                    }}
                  >
                    Add client
                  </Button>
                )
              }
              icon="◍"
            />
          ) : (
            <ul className="divide-y divide-neutral-200">
              {visible.map((client) => (
                <li
                  key={client.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                    >
                      {fullName(client)}
                    </Link>
                    <p className="text-sm text-neutral-600">
                      {[client.email, client.phone]
                        .filter(Boolean)
                        .join(" · ") || "No contact details"}
                    </p>
                    {client.notes ? (
                      <p className="max-w-prose text-sm text-neutral-600">
                        {client.notes}
                      </p>
                    ) : null}
                    <p className="text-xs text-neutral-500">
                      {client._count.appointments} appointment
                      {client._count.appointments === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreating(false);
                        setEditing(client);
                      }}
                    >
                      Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="danger" size="sm">
                          Archive
                        </Button>
                      }
                      title={`Archive ${fullName(client)}?`}
                      description="Archiving hides the client from lists but keeps their appointment history intact. You can bring them back at any time."
                      confirmLabel="Archive client"
                      onConfirm={() => handleArchive(client)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {reloading ? (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Spinner /> Refreshing clients…
        </p>
      ) : null}
    </div>
  );
}

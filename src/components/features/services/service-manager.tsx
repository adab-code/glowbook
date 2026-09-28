"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { ServiceForm } from "@/components/features/services/service-form";
import { apiFetch, toMessage } from "@/lib/utils/api-client";
import { formatMoney } from "@/lib/utils/format";
import type { Service } from "@/generated/prisma/client";

export function ServiceManager({
  initialServices,
  currency,
}: {
  initialServices: Service[];
  currency: string;
}) {
  const [services, setServices] = useState(initialServices);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reloading, startReload] = useTransition();

  async function reload() {
    startReload(async () => {
      try {
        const result = await apiFetch<{ data: Service[] }>("/api/services");
        setServices(result.data);
      } catch (error) {
        setMessage(toMessage(error));
      }
    });
  }

  async function handleDelete(service: Service) {
    const result = await apiFetch<{
      data: Service | { id: string; deleted: boolean };
      meta?: { message?: string };
    }>(`/api/services/${service.id}`, { method: "DELETE" });

    setMessage(result.meta?.message ?? `${service.name} was deleted.`);
    await reload();
  }

  function startEdit(service: Service) {
    setCreating(false);
    setEditing(service);
  }

  function startCreate() {
    setEditing(null);
    setCreating(true);
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

      {creating || editing ? (
        <ServiceForm
          key={editing?.id ?? "new"}
          initial={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  description: editing.description ?? "",
                  price: (editing.priceCents / 100).toFixed(2),
                  duration: String(editing.durationMinutes),
                  isActive: editing.isActive,
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
        <Button onClick={startCreate}>Add service</Button>
      )}

      <Card>
        <CardContent className="p-0 sm:p-0">
          {services.length === 0 ? (
            <EmptyState
              title="No services yet"
              description="Add your first offering so you can start booking appointments."
              action={<Button onClick={startCreate}>Add service</Button>}
              icon="✦"
            />
          ) : (
            <ul className="divide-y divide-neutral-200">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-neutral-900">
                        {service.name}
                      </p>
                      {service.isActive ? null : (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          Archived
                        </span>
                      )}
                    </div>
                    {service.description ? (
                      <p className="text-sm text-neutral-600">
                        {service.description}
                      </p>
                    ) : null}
                    <p className="text-sm text-neutral-600">
                      {formatMoney(service.priceCents, currency)} ·{" "}
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(service)}
                    >
                      Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="danger" size="sm">
                          Delete
                        </Button>
                      }
                      title={`Delete ${service.name}?`}
                      description="If this service is already part of an appointment it will be archived instead, so past bookings keep their history."
                      confirmLabel="Delete service"
                      onConfirm={() => handleDelete(service)}
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
          <Spinner /> Refreshing services…
        </p>
      ) : null}
    </div>
  );
}

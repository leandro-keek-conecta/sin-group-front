import axios from "axios";
import { ILHA_WEBHOOK_URL } from "../constants";
import type {
  CalendlyEvent,
  CalendlyEventType,
  CalendlyInvitee,
  CalendlySchedulingLink,
  CalendlySlot,
} from "../types";

// Os nós do n8n ainda serão adicionados pelo time de automação. O contrato
// abaixo assume que o webhook expõe os seguintes tipos no Switch:
//
//   { Type: "calendly.events"          }                            -> lista
//   { Type: "calendly.eventDetail",    uri   }                      -> detalhe + invitees
//   { Type: "calendly.eventTypes"      }                            -> tipos ativos
//   { Type: "calendly.slots",          eventType, startTime, endTime } -> slots
//   { Type: "calendly.schedulingLink", eventType }                  -> link único
//   { Type: "calendly.cancel",         uri, reason? }               -> cancelamento
//
// Cada branch do Switch deve terminar num Respond to Webhook devolvendo o
// payload raw da Calendly (collection.resource) para reaproveitarmos os
// normalizers aqui.

type CalendlyEventsParams = {
  status?: "active" | "canceled";
  minStartTime?: Date;
  maxStartTime?: Date;
  count?: number;
};

type CalendlySlotsParams = {
  eventTypeUri: string;
  startTime: Date;
  endTime: Date;
};

type CalendlyCancelParams = {
  uri: string;
  reason?: string;
};

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const response = await axios.post(ILHA_WEBHOOK_URL, body);
  if (response.status !== 200) {
    throw new Error(`Falha Calendly (HTTP ${response.status})`);
  }
  return response.data as T;
}

function toDate(v: unknown): Date {
  return v ? new Date(String(v)) : new Date(0);
}

function uuidFromUri(uri: string): string {
  const parts = uri.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? uri;
}

function normalizeEvent(raw: any): CalendlyEvent {
  const uri: string = String(raw?.uri ?? "");
  return {
    uri,
    uuid: uuidFromUri(uri),
    name: String(raw?.name ?? "Evento"),
    status: raw?.status === "canceled" ? "canceled" : "active",
    startTime: toDate(raw?.start_time),
    endTime: toDate(raw?.end_time),
    eventTypeUri: raw?.event_type ? String(raw.event_type) : null,
    location: raw?.location
      ? {
          type: String(raw.location.type ?? ""),
          location: raw.location.location ? String(raw.location.location) : undefined,
          joinUrl: raw.location.join_url ? String(raw.location.join_url) : undefined,
        }
      : null,
    organizer: raw?.event_memberships?.[0]
      ? {
          name: String(raw.event_memberships[0].user_name ?? ""),
          email: String(raw.event_memberships[0].user_email ?? ""),
        }
      : null,
    inviteesCount:
      typeof raw?.invitees_counter?.active === "number"
        ? raw.invitees_counter.active
        : typeof raw?.invitees_counter?.total === "number"
        ? raw.invitees_counter.total
        : 0,
    createdAt: raw?.created_at ? toDate(raw.created_at) : null,
  };
}

function normalizeInvitee(raw: any): CalendlyInvitee {
  return {
    uri: String(raw?.uri ?? ""),
    name: String(raw?.name ?? ""),
    email: String(raw?.email ?? ""),
    phone: raw?.text_reminder_number ? String(raw.text_reminder_number) : undefined,
    status: raw?.status === "canceled" ? "canceled" : "active",
    questionsAndAnswers: Array.isArray(raw?.questions_and_answers)
      ? raw.questions_and_answers.map((q: any) => ({
          question: String(q?.question ?? ""),
          answer: String(q?.answer ?? ""),
        }))
      : [],
    cancelUrl: raw?.cancel_url ? String(raw.cancel_url) : undefined,
    rescheduleUrl: raw?.reschedule_url ? String(raw.reschedule_url) : undefined,
  };
}

function normalizeEventType(raw: any): CalendlyEventType {
  const uri: string = String(raw?.uri ?? "");
  return {
    uri,
    uuid: uuidFromUri(uri),
    name: String(raw?.name ?? "Tipo de evento"),
    duration: Number(raw?.duration ?? 0),
    schedulingUrl: String(raw?.scheduling_url ?? ""),
    color: String(raw?.color ?? "#ff4f01"),
    active: Boolean(raw?.active),
    slug: raw?.slug ? String(raw.slug) : null,
  };
}

function normalizeSlot(raw: any): CalendlySlot {
  return {
    startTime: toDate(raw?.start_time),
    status: raw?.status === "available" ? "available" : "unavailable",
    schedulingUrl: String(raw?.scheduling_url ?? ""),
    inviteesRemaining: Number(raw?.invitees_remaining ?? 1),
  };
}

function extractCollection(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.collection)) return obj.collection as any[];
    if (Array.isArray(obj.data)) return obj.data as any[];
  }
  return [];
}

export async function fetchCalendlyEvents(
  params: CalendlyEventsParams = {},
): Promise<CalendlyEvent[]> {
  const body: Record<string, unknown> = { Type: "calendly.events" };
  if (params.status) body.status = params.status;
  if (params.minStartTime) body.min_start_time = params.minStartTime.toISOString();
  if (params.maxStartTime) body.max_start_time = params.maxStartTime.toISOString();
  if (params.count) body.count = params.count;
  const raw = await call<unknown>(body);
  return extractCollection(raw).map(normalizeEvent);
}

export async function fetchCalendlyEventDetail(
  uri: string,
): Promise<{ event: CalendlyEvent; invitees: CalendlyInvitee[] }> {
  const raw = await call<any>({ Type: "calendly.eventDetail", uri });
  const eventRaw = raw?.event ?? raw?.resource ?? raw;
  const inviteesRaw = raw?.invitees ?? extractCollection(raw?.invitees_collection);
  return {
    event: normalizeEvent(eventRaw),
    invitees: (inviteesRaw as any[]).map(normalizeInvitee),
  };
}

export async function fetchCalendlyEventTypes(): Promise<CalendlyEventType[]> {
  const raw = await call<unknown>({ Type: "calendly.eventTypes" });
  return extractCollection(raw).map(normalizeEventType);
}

export async function fetchCalendlySlots(
  params: CalendlySlotsParams,
): Promise<CalendlySlot[]> {
  const raw = await call<unknown>({
    Type: "calendly.slots",
    eventType: params.eventTypeUri,
    startTime: params.startTime.toISOString(),
    endTime: params.endTime.toISOString(),
  });
  return extractCollection(raw).map(normalizeSlot);
}

export async function createCalendlySchedulingLink(params: {
  eventTypeUri: string;
}): Promise<CalendlySchedulingLink> {
  const raw = await call<any>({
    Type: "calendly.schedulingLink",
    eventType: params.eventTypeUri,
  });
  const resource = raw?.resource ?? raw;
  return {
    bookingUrl: String(resource?.booking_url ?? ""),
    owner: String(resource?.owner ?? params.eventTypeUri),
    ownerType: String(resource?.owner_type ?? "EventType"),
  };
}

export async function cancelCalendlyEvent(
  params: CalendlyCancelParams,
): Promise<CalendlyEvent> {
  const raw = await call<any>({
    Type: "calendly.cancel",
    uri: params.uri,
    reason: params.reason,
  });
  return normalizeEvent(raw?.resource ?? raw);
}

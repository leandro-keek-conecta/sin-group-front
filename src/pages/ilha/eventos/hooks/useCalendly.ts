import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCalendlyEvent,
  createCalendlySchedulingLink,
  fetchCalendlyEventDetail,
  fetchCalendlyEventTypes,
  fetchCalendlyEvents,
  fetchCalendlySlots,
} from "../../services/calendlyService";
import type {
  CalendlyEvent,
  CalendlyEventType,
  CalendlyInvitee,
  CalendlySchedulingLink,
  CalendlySlot,
} from "../../types";

const BASE_KEY = ["ilha-calendly"] as const;
const STALE_MS = 60 * 1000;

type EventsFilter = {
  status?: "active" | "canceled";
  minStartTime?: Date;
  maxStartTime?: Date;
  count?: number;
};

export function useCalendlyEvents(params: EventsFilter = {}) {
  return useQuery<CalendlyEvent[], Error>({
    queryKey: [
      ...BASE_KEY,
      "events",
      params.status ?? "all",
      params.minStartTime?.toISOString() ?? null,
      params.maxStartTime?.toISOString() ?? null,
      params.count ?? null,
    ],
    queryFn: () => fetchCalendlyEvents(params),
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCalendlyEventDetail(uri: string | null) {
  return useQuery<{ event: CalendlyEvent; invitees: CalendlyInvitee[] }, Error>({
    queryKey: [...BASE_KEY, "eventDetail", uri],
    queryFn: () => fetchCalendlyEventDetail(uri as string),
    enabled: Boolean(uri),
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCalendlyEventTypes() {
  return useQuery<CalendlyEventType[], Error>({
    queryKey: [...BASE_KEY, "eventTypes"],
    queryFn: fetchCalendlyEventTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

type SlotsArgs = {
  eventTypeUri: string | null;
  startTime: Date;
  endTime: Date;
  enabled?: boolean;
};

export function useCalendlySlots({ eventTypeUri, startTime, endTime, enabled = true }: SlotsArgs) {
  return useQuery<CalendlySlot[], Error>({
    queryKey: [
      ...BASE_KEY,
      "slots",
      eventTypeUri,
      startTime.toISOString(),
      endTime.toISOString(),
    ],
    queryFn: () =>
      fetchCalendlySlots({
        eventTypeUri: eventTypeUri as string,
        startTime,
        endTime,
      }),
    enabled: enabled && Boolean(eventTypeUri),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateSchedulingLink() {
  return useMutation<CalendlySchedulingLink, Error, { eventTypeUri: string }>({
    mutationFn: (vars) => createCalendlySchedulingLink(vars),
  });
}

export function useCancelEvent() {
  const qc = useQueryClient();
  return useMutation<CalendlyEvent, Error, { uri: string; reason?: string }>({
    mutationFn: (vars) => cancelCalendlyEvent(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BASE_KEY, "events"] });
      qc.invalidateQueries({ queryKey: [...BASE_KEY, "eventDetail"] });
    },
  });
}

import { useCallback, useMemo, useState, useEffect } from "react";
import type { IlhaUser, IlhaConversation } from "../../types";

const TABS_STORAGE_KEY = "ilha-tabs-collapsed";

export function useChatFilters(users: IlhaUser[]) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [tabsCollapsed, setTabsCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TABS_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setTabsCollapsed = useCallback((v: boolean) => {
    setTabsCollapsedState(v);
    try {
      localStorage.setItem(TABS_STORAGE_KEY, String(v));
    } catch {}
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [u.nome, u.telefone, u.maskedPhone, u.latestStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = useMemo<IlhaUser | null>(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    if (!selectedUser) return;
    const validIds = new Set(selectedUser.conversations.map((c) => c.id));
    if (!selectedConversationId || !validIds.has(selectedConversationId)) {
      setSelectedConversationId(selectedUser.conversations[0]?.id ?? null);
    }
  }, [selectedUser, selectedConversationId]);

  const selectedConversation = useMemo<IlhaConversation | null>(
    () =>
      selectedUser?.conversations.find((c) => c.id === selectedConversationId) ?? null,
    [selectedUser, selectedConversationId]
  );

  return {
    search,
    setSearch,
    filteredUsers,
    selectedUser,
    selectedUserId,
    setSelectedUserId,
    selectedConversation,
    selectedConversationId,
    setSelectedConversationId,
    tabsCollapsed,
    setTabsCollapsed,
  };
}

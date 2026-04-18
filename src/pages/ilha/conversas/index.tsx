import { Box, CircularProgress, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { useChatFilters } from "./hooks/useChatFilters";
import { ConversationsList } from "./components/ConversationsList";
import { ChatThread } from "./components/ChatThread";
import { UserInfoPanel } from "./components/UserInfoPanel";
import { ConversationTabs } from "./components/ConversationTabs";
import { AssistantTransferBadge } from "./components/AssistantTransferBadge";
import type { IlhaUser } from "../types";

export default function IlhaConversas() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Erro ao carregar conversas: {error?.message ?? "sem dados"}</Typography>
      </Box>
    );
  }

  return <ConversasShell users={data.users} />;
}

function ConversasShell({ users }: { users: IlhaUser[] }) {
  const {
    search, setSearch,
    filteredUsers,
    selectedUser, selectedUserId, setSelectedUserId,
    selectedConversation, selectedConversationId, setSelectedConversationId,
    tabsCollapsed, setTabsCollapsed,
  } = useChatFilters(users);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr) minmax(280px, 360px)",
        height: "calc(100dvh - 3rem)",
        minHeight: 0,
      }}
    >
      <ConversationsList
        users={filteredUsers}
        allUsersCount={users.length}
        search={search}
        onSearchChange={setSearch}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
      />

      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {selectedUser && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography fontWeight={700}>{selectedUser.nome}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser.maskedPhone || "Telefone indisponível"}
              </Typography>
            </Box>
            {selectedConversation?.transferredToAssistant && (
              <AssistantTransferBadge
                assistantName={selectedConversation.assistantName}
                transferredAt={selectedConversation.transferredAt}
              />
            )}
          </Box>
        )}

        {selectedUser && (
          <ConversationTabs
            conversations={selectedUser.conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            collapsed={tabsCollapsed}
            onToggleCollapse={() => setTabsCollapsed(!tabsCollapsed)}
          />
        )}

        <ChatThread conversation={selectedConversation} />
      </Box>

      <UserInfoPanel user={selectedUser} conversation={selectedConversation} />
    </Box>
  );
}

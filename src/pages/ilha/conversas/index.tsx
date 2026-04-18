import { Box, CircularProgress, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { useChatFilters } from "./hooks/useChatFilters";
import { ConversationsList } from "./components/ConversationsList";
import { ChatThread } from "./components/ChatThread";
import { UserInfoPanel } from "./components/UserInfoPanel";
import { ConversationTabs } from "./components/ConversationTabs";
import { AssistantTransferBadge } from "./components/AssistantTransferBadge";
import type { IlhaUser } from "../types";
import { ilhaTokens } from "../theme/tokens";

export default function IlhaConversas() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
        }}
      >
        <CircularProgress sx={{ color: ilhaTokens.color.accent }} />
      </Box>
    );
  }
  if (error || !data) {
    return (
      <Box sx={{ p: `${ilhaTokens.space.xl}px` }}>
        <Typography sx={{ color: ilhaTokens.color.danger }}>
          Erro ao carregar conversas: {error?.message ?? "sem dados"}
        </Typography>
      </Box>
    );
  }

  return <ConversasShell users={data.users} />;
}

function ConversasShell({ users }: { users: IlhaUser[] }) {
  const {
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
  } = useChatFilters(users);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `${ilhaTokens.layout.conversationsListWidth}px minmax(0, 1fr) ${ilhaTokens.layout.userInfoPanelWidth}px`,
        },
        height: `calc(100dvh - 3rem - ${ilhaTokens.layout.tabBarHeight}px)`,
        minHeight: 0,
        bgcolor: ilhaTokens.color.bgSurface,
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
          <Box
            sx={{
              px: `${ilhaTokens.space["2xl"]}px`,
              py: `${ilhaTokens.space.md}px`,
              borderBottom: `1px solid ${ilhaTokens.color.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: ilhaTokens.color.bgSurface,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.h1.size,
                  fontWeight: ilhaTokens.font.h1.weight,
                  color: ilhaTokens.color.textPrimary,
                  lineHeight: 1.3,
                }}
              >
                {selectedUser.nome}
              </Typography>
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.caption.size,
                  color: ilhaTokens.color.textTertiary,
                }}
              >
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

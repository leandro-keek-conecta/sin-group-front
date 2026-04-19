import { Box, CircularProgress, IconButton, Typography, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const isDesktop = useMediaQuery("(min-width: 900px)");
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
  } = useChatFilters(users, { autoSelectFirst: isDesktop });

  const mobileShowingThread = !isDesktop && Boolean(selectedUserId);

  if (isDesktop) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `${ilhaTokens.layout.conversationsListWidth}px minmax(0, 1fr) ${ilhaTokens.layout.userInfoPanelWidth}px`,
          height: "calc(100dvh - 3rem)",
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
            <ConversationHeader
              user={selectedUser}
              transferred={Boolean(selectedConversation?.transferredToAssistant)}
              assistantName={selectedConversation?.assistantName ?? null}
              transferredAt={selectedConversation?.transferredAt ?? null}
            />
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

  return (
    <Box
      sx={{
        height: `calc(100dvh - 3rem - ${ilhaTokens.layout.tabBarHeight}px)`,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      {mobileShowingThread && selectedUser ? (
        <>
          <ConversationHeader
            user={selectedUser}
            transferred={Boolean(selectedConversation?.transferredToAssistant)}
            assistantName={selectedConversation?.assistantName ?? null}
            transferredAt={selectedConversation?.transferredAt ?? null}
            onBack={() => setSelectedUserId(null)}
          />
          <ConversationTabs
            conversations={selectedUser.conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            collapsed={tabsCollapsed}
            onToggleCollapse={() => setTabsCollapsed(!tabsCollapsed)}
          />
          <ChatThread conversation={selectedConversation} />
        </>
      ) : (
        <ConversationsList
          users={filteredUsers}
          allUsersCount={users.length}
          search={search}
          onSearchChange={setSearch}
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
          compact
        />
      )}
    </Box>
  );
}

interface ConversationHeaderProps {
  user: IlhaUser;
  transferred: boolean;
  assistantName: string | null;
  transferredAt: Date | null;
  onBack?: () => void;
}

function headerSubtitle(user: IlhaUser): string {
  const phone = user.maskedPhone;
  if (phone && !phone.startsWith("#")) return phone;
  const last = user.ultimoContato;
  if (last instanceof Date && !Number.isNaN(last.getTime()) && last.getTime() > 0) {
    const diffMin = Math.floor((Date.now() - last.getTime()) / 60_000);
    if (diffMin < 1) return "visto agora";
    if (diffMin < 60) return `visto há ${diffMin} min`;
    if (diffMin < 60 * 24) return `visto há ${Math.floor(diffMin / 60)} h`;
    const days = Math.floor(diffMin / (60 * 24));
    if (days < 7) return `visto há ${days} dia${days === 1 ? "" : "s"}`;
    return `visto em ${last.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
  }
  return `${user.qtdInteracoes} interações`;
}

function headerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function ConversationHeader({
  user,
  transferred,
  assistantName,
  transferredAt,
  onBack,
}: ConversationHeaderProps) {
  const subtitle = headerSubtitle(user);
  const initials = headerInitials(user.nome);
  const isMobile = Boolean(onBack);

  return (
    <Box
      sx={{
        px: { xs: `${ilhaTokens.space.md}px`, md: `${ilhaTokens.space["2xl"]}px` },
        py: `${ilhaTokens.space.sm}px`,
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: `${ilhaTokens.space.sm}px`,
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: `${ilhaTokens.space.sm}px`,
          minWidth: 0,
          flex: 1,
        }}
      >
        {onBack && (
          <IconButton
            aria-label="voltar"
            size="small"
            onClick={onBack}
            sx={{
              color: ilhaTokens.color.textSecondary,
              mr: "-4px",
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        {isMobile && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: ilhaTokens.color.accentSoft,
              color: "#A85300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: ilhaTokens.font.family,
              fontSize: ilhaTokens.font.bodyStrong.size,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
            aria-hidden
          >
            {initials}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontSize: ilhaTokens.font.h1.size,
              fontWeight: ilhaTokens.font.h1.weight,
              color: ilhaTokens.color.textPrimary,
              lineHeight: 1.25,
            }}
          >
            {user.nome}
          </Typography>
          <Typography
            noWrap
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textTertiary,
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {transferred && (
        <AssistantTransferBadge
          assistantName={assistantName}
          transferredAt={transferredAt}
        />
      )}
    </Box>
  );
}

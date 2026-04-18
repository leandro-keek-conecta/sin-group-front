import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function ConversionFunnel({ data }: Props) {
  const funnel = data.aggregates.funnel ?? [];
  const total = funnel[0]?.count ?? 0;

  const stepHeaders = [
    "Iniciou conversa",
    "Tirou dúvida",
    "Pediu informação",
    "Pediu disponibilidade",
    "Transferido",
  ];

  const rows = funnel.length > 0
    ? funnel
    : stepHeaders.map((label) => ({ label, count: 0 }));

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          01 — PIPELINE
        </Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Funil de conversão
        </Typography>

        <Stack spacing={1.25}>
          {rows.map((row, i) => {
            const share = total > 0 ? row.count / total : 0;
            const percent = Math.round(share * 100);
            const complete = row.count > 0;
            return (
              <Box key={row.label}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mb={0.5}
                >
                  {complete ? (
                    <CheckCircleIcon
                      sx={{ fontSize: 18, color: ILHA_PALETTE.primary }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ fontSize: 18, color: "text.disabled" }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      flex: 1,
                      color: complete ? "text.primary" : "text.secondary",
                    }}
                  >
                    {i + 1}. {row.label}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${row.count}`}
                    sx={{
                      height: 22,
                      fontWeight: 700,
                      bgcolor: complete ? "rgba(255,122,1,0.12)" : "action.hover",
                      color: complete ? ILHA_PALETTE.primary : "text.secondary",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 36, textAlign: "right" }}
                  >
                    {percent}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={share * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: `rgba(255,122,1,${Math.max(0.35, 1 - i * 0.15)})`,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

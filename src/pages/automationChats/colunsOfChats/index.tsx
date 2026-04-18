import { GridColDef } from "@mui/x-data-grid";

export const columnsAutomationChats: GridColDef[] = [
  {
    field: "title",
    headerName: "Titulo",
    minWidth: 160,
    flex: 1,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "slug",
    headerName: "Slug",
    minWidth: 140,
    flex: 1,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "url",
    headerName: "URL",
    minWidth: 200,
    flex: 1.5,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "projectNames",
    headerName: "Projetos",
    minWidth: 180,
    flex: 1,
    sortable: false,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "isActive",
    headerName: "Status",
    minWidth: 110,
    flex: 0.5,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (params.value ? "Ativo" : "Inativo"),
  },
];

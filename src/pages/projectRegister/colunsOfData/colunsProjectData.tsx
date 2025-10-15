import { GridColDef } from "@mui/x-data-grid";

export const columnsProject: GridColDef[] = [
  {
    field: "name",
    headerName: "nome do projeto",
    minWidth: 150,
    flex: 1,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "logoUrl",
    headerName: "Url da Logo",
    minWidth: 220,
    flex: 2,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "corHex",
    headerName: "Cor padrão do Projeto",
    minWidth: 100,
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
];

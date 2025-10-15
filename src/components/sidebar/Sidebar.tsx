import { useEffect, useMemo, useState, Fragment } from "react";
import styles from "./sidebar.module.css";
import { ItemMenu } from "../ItemMenu";
import { usePowerBI } from "@/context/powerbiContext";
import { mappedBySection, Section } from "@/utils/MappedBySection";
import { BarChart, Public } from "@mui/icons-material";
import { Skeleton, Box, CircularProgress } from "@mui/material";

interface PropriedadesSidebar {
  estaAberta: boolean;
  isMobile?: boolean;
  aoFechar?: () => void;
  // opcional: se a página pai souber que NÃO há dashboard, pode passar true aqui e pulamos o skeleton
  noDashboard?: boolean;
}

export function Sidebar({
  estaAberta,
  isMobile = false,
  aoFechar,
  noDashboard = false,
}: PropriedadesSidebar) {
  const { pages, reportInstance } = usePowerBI();
  const [sections, setSections] = useState<Section[]>([]);
  const [activePage, setActivePage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // "boot loading" só enquanto de fato estiver tentando carregar um report
  const isBootLoading = useMemo(
    () => !noDashboard && !showFallback && (!pages || pages.length === 0),
    [noDashboard, showFallback, pages]
  );

  // se não houver reportInstance e também não vieram páginas após um tempo, ativa fallback
  useEffect(() => {
    if (noDashboard) {
      setShowFallback(true);
      return;
    }
    if (pages && pages.length > 0) {
      setShowFallback(false);
      return;
    }
    if (reportInstance) {
      // realmente carregando um report → mantém skeleton
      setShowFallback(false);
      return;
    }
    const t = setTimeout(() => setShowFallback(true), 1200); // 1.2s é agradável
    return () => clearTimeout(t);
  }, [noDashboard, pages, reportInstance]);

  const handleChangePage = async (pageName: string) => {
    if (!reportInstance) {
      console.warn("⚠️ Power BI ainda não carregado.");
      return;
    }
    try {
      setLoading(true);
      const all = await reportInstance.getPages();
      const target = all.find((p: any) => p.name === pageName || p.displayName === pageName);
      if (target) {
        await target.setActive();
        setActivePage(pageName);
        if (isMobile && aoFechar) aoFechar();
      } else {
        console.warn("❌ Página não encontrada:", pageName);
      }
    } catch (err) {
      console.error("Erro ao mudar de página:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSections(mappedBySection(pages ?? []));
  }, [pages]);

  const hasSections = sections.length > 0 && sections.some(s => s.items.length > 0);

  return (
    <nav className={styles.sidebarNav}>

      <ul className={styles.ulStyle}>
        {isBootLoading ? (
          <SkeletonMenu estaAberta={estaAberta} />
        ) : hasSections ? (
          sections.map((sec) => (
            <Fragment key={sec.section}>
              <ItemMenu rotulo={sec.section.toUpperCase()} isTitle estaAberta={estaAberta} />
              {sec.items.map((item) => (
                <ItemMenu
                  key={item.name}
                  icone={item.icon}
                  rotulo={item.displayName}
                  para="#"
                  estaAberta={estaAberta}
                  onClick={() => handleChangePage(item.name)}
                  isActive={activePage === item.name}
                />
              ))}
            </Fragment>
          ))
        ) : (
          // Fallback quando não há dashboard/páginas
          <>
            <ItemMenu rotulo="PAINÉIS GERAIS" isTitle estaAberta={estaAberta} />
            <ItemMenu
              icone={<BarChart />}
              rotulo="Visão Geral"
              para="/projeto"
              estaAberta={estaAberta}
              onClick={isMobile ? aoFechar : undefined}
            />
          </>
        )}
      </ul>
    </nav>
  );
}

/* ---------- Skeleton do menu ---------- */
function SkeletonMenu({ estaAberta }: { estaAberta: boolean }) {
  const itemH = 36;
  return (
    <>
      <li>
        <Box className={styles.menuItem} sx={{ py: 0.5 }}>
          <Skeleton variant="text" width={estaAberta ? 140 : 24} height={20} />
        </Box>
      </li>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={`sk-${i}`}>
          <Box className={styles.menuItem} sx={{ height: itemH, display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            {estaAberta && <Skeleton variant="text" width={120 + (i % 3) * 50} height={18} />}
          </Box>
        </li>
      ))}
    </>
  );
}

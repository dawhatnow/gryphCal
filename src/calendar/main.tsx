import { createRoot } from "react-dom/client";
import "../styles.css";
import { CalendarPage } from "./CalendarPage";
import { applyTheme, getTheme } from "../shared/theme";

applyTheme(getTheme());
createRoot(document.getElementById("root")!).render(<CalendarPage />);

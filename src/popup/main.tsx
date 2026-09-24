import { createRoot } from "react-dom/client";
import "../styles.css";
import { Popup } from "./Popup";
import { applyTheme, getTheme } from "../shared/theme";

applyTheme(getTheme());
createRoot(document.getElementById("root")!).render(<Popup />);

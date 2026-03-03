import { defineContentScript } from "wxt/utils/define-content-script";
import { startPageExtractor } from "../src/content/index";

export default defineContentScript({
  matches: ["https://*/*"],
  runAt: "document_end",
  main() {
    startPageExtractor();
  },
});

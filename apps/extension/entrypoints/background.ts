import { defineBackground } from "wxt/utils/define-background";
import { startBackgroundService } from "../src/background/index";

export default defineBackground(() => {
  try {
    startBackgroundService();
  } catch (error) {
    console.error("Background entrypoint failed:", error);
  }
});

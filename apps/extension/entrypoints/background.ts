import { defineBackground } from "wxt/utils/define-background";
import { startBackgroundService } from "../src/background/index";

export default defineBackground(() => {
  startBackgroundService();
});

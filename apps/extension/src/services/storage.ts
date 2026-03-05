import type { User, UserSettings } from "@/types";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/core/storage/sessionStorage";
import {
  clearAllStorage,
  getSettings,
  getUserData,
  setSettings,
  setUserData,
} from "@/core/storage/userStorage";

export class StorageService {
  static async setToken(token: string): Promise<void> {
    await setAuthToken(token);
  }

  static async getToken(): Promise<string | undefined> {
    return getAuthToken();
  }

  static async clearToken(): Promise<void> {
    await clearAuthToken();
  }

  static async setUserData(userData: User): Promise<void> {
    await setUserData(userData);
  }

  static async getUserData(): Promise<User | undefined> {
    return getUserData();
  }

  static async setSettings(settings: UserSettings): Promise<void> {
    await setSettings(settings);
  }

  static async getSettings(): Promise<UserSettings | undefined> {
    return getSettings();
  }

  static async clearAll(): Promise<void> {
    await clearAllStorage();
  }
}

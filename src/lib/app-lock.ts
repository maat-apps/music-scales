import { createAppLock } from "@maat-apps/core/lock";

import { relockAfterMs, setLockEnrolment } from "./app-settings";
import { encryptionKey } from "./encryption-key";

// NEVER change this once the app has users: it's part of how their data is
// encrypted, so a different value makes every encrypted record unreadable.
export const HKDF_INFO = "music-scales-data-v1";

// Every maat-apps app has the app lock (@maat-apps/core/lock): a WebAuthn
// gate that encrypts the app's data when the authenticator supports PRF, a
// UI gate otherwise. Scales keeps no user data — only settings, which stay
// readable so the lock can start — so there's nothing to rewrite or erase.
export const appLock = createAppLock({
  name: "Skale",
  keyInfo: HKDF_INFO,
  keyHolder: encryptionKey,
  relockAfterMs,
  saveEnrolment: setLockEnrolment,
  data: {
    rewrite: () => {},
    erase: () => {},
  },
});

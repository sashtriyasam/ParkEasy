# ParkEasy Mobile — Production Operations Guide

This guide contains the exact terminal commands and operational logic for managing the ParkEasy production lifecycle.

---

## 🏗 Builds & Distribution (EAS Build)

### a. Building your first APK (Internal Testing)
Generate a distributable Android APK to share directly with stakeholders.
```bash
eas build --platform android --profile production
```
> [!TIP]
> Use the `production` profile to get a signed, production-ready APK. For the Google Play Store, swap to the `release` profile to generate an AAB.

---

## 🚀 OTA Updates (EAS Update)

### b. Publishing an OTA Update
Push JavaScript and asset changes directly to installed apps instantly.
```bash
eas update --branch production --message "Fix: Slot grid legend alignment"
```

### c. Publishing to a Specific Channel
Target different user groups (e.g., internal testers vs. end-users).
```bash
# Push to Preview channel
eas update --channel preview --message "New UI polish pass"

# Push to Production channel
eas update --channel production --message "v1.0.1 minor fixes"
```

### d. Checking Update Status
View all published updates and see which groups are on which version.
```bash
eas update:list
```

### e. Rolling Back an Update
If a recent update causes issues, you can instantly revert users to a stable state.
```bash
# Revert the 'production' branch to a specific stable update group
eas update:rollback --branch production
```

---

## 🚦 Deployment Strategy (When to build vs. OTA)

### f. Decision Matrix

| Change Type | Update Method | Example |
| :--- | :--- | :--- |
| **JS/Logic** | ✨ **OTA (Instant)** | Fixed a calculation error in the Earnings dashboard. |
| **UI/Styles** | ✨ **OTA (Instant)** | Changed primary color or fixed card shadow elevation. |
| **Permissions** | 🏗 **EAS Build (New APK)** | Adding Camera access for a new QR scanner feature. |
| **Native Modules**| 🏗 **EAS Build (New APK)** | Installing a new package like `expo-location` for the first time. |
| **App Icons** | 🏗 **EAS Build (New APK)** | Changing the adaptive icon on the Android home screen. |

---

## 📦 Local Development

### Start Development Server
```bash
npx expo start
```

### Clear Expo Cache
```bash
npx expo start -c
```

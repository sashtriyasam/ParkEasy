# ParkEasy Mobile — EAS Cheat Sheet

This guide contains the most common commands for managing the ParkEasy mobile application using Expo Application Services (EAS).

---

## 🏗 Builds & Deployment

### Android APK (Development)
Build a debug/test APK to install directly on devices.
```bash
eas build --platform android --profile development
```

### Android APK (Direct Distribution/Internal)
Build a high-fidelity production APK to share directly with stakeholders.
```bash
eas build --platform android --profile production
```

> [!NOTE]
> We have configured the `production` profile in `eas.json` to produce an **APK** instead of an AAB for easier direct installation during this phase.

---

## 🚀 OTA Updates (Over-The-Air)

OTA updates allow you to push code changes (JS/Assets) directly to existing installed APKs without requiring users to download a new file.

### 📝 1. Prepare and Publish
This triggers a high-fidelity update to the production channel.
```bash
eas update --auto --branch production --message "Description of changes"
```

### 🔍 2. Verify Updates
Check the status of your published updates.
```bash
eas update:list
```

### 🔄 3. Force Update (Optional)
If you need to strictly verify the latest version on a device:
1. Close the app completely.
2. Re-open it twice (once to download, once to apply).

---

## 🔐 Credentials & Secrets

### View Project Secrets
```bash
eas secret:list
```

### Add a New Secret (e.g., API URL)
```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://your-api.com/api/v1"
```

---

## 🛠 Troubleshooting

### Clear Cache and Rebuild
```bash
eas build --platform android --profile preview --clear-cache
```

### Check Built App Logs (Development Only)
```bash
npx expo start --dev-client
```

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

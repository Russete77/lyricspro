# Clerk Authentication Removal from Electron Build

## Problem
The Electron build was failing with `ERR_CONNECTION_REFUSED` error on machines without development environment. Root cause was Clerk authentication requiring environment variables and internet connectivity.

## Solution
Removed Clerk authentication completely from Electron version (offline mode only).

## Changes Made

### 1. `components/ui/Header.tsx`
- Changed Clerk component imports to **dynamic imports with `ssr: false`**
- This prevents Clerk from being loaded during Next.js pre-rendering
- Added runtime detection to only show Clerk UI in web mode (not Electron)

```typescript
// Before
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

// After
const UserButton = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.UserButton),
  { ssr: false }
);
// ... same for SignedIn, SignedOut, SignInButton
```

### 2. `app/layout.tsx`
- Conditionally skip `<ClerkProvider>` when `ELECTRON=true`
- Electron mode renders app without authentication wrapper

```typescript
const isElectron = process.env.ELECTRON === 'true';

if (isElectron) {
  // No ClerkProvider for Electron
  return <html>...</html>;
}

// Web mode includes ClerkProvider
return <ClerkProvider>...</ClerkProvider>;
```

### 3. `.env.electron`
- Created dummy Clerk environment variables for build process
- These are required for Next.js build to succeed but are never actually used

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dummy_key_for_electron_build_only
CLERK_SECRET_KEY=sk_test_dummy_key_for_electron_build_only
```

## Why Dynamic Imports Were Necessary

Initial attempts to conditionally import Clerk failed because:
1. Next.js pre-renders pages during build (`next build`)
2. Even with `'use client'`, components are rendered server-side first
3. When `ELECTRON=true`, `<ClerkProvider>` wasn't available
4. Clerk components threw error: "SignedOut can only be used within <ClerkProvider>"

Dynamic imports with `ssr: false` fix this by:
- Skipping component loading during server-side rendering
- Only loading Clerk components on client-side (browser)
- Using `isClient` state to ensure components only render after hydration

## Build Process

```bash
# Build for Electron (no authentication)
npm run build:electron

# Package into executable
npm run package

# Create ZIP for distribution
cd out && powershell Compress-Archive -Path LyricsPro-win32-x64 -DestinationPath LyricsPro-win32-x64-1.0.0.zip
```

## Result

- ✅ Electron build succeeds without Clerk errors
- ✅ App runs completely offline (no authentication required)
- ✅ Web version still uses Clerk authentication normally
- ✅ Settings page accessible in both modes for OpenAI API key configuration
- ✅ Package size: ~170 MB

## Testing

The app should now work on any Windows machine with only Node.js installed (no Clerk keys, no internet for auth required).

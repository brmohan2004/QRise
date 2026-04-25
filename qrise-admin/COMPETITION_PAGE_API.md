# Competition Page Component API

This document defines the requirements for custom `.tsx` files uploaded to the QRise Competitions module.

## File Format
- Files must be valid React components using **TypeScript (.tsx)**.
- Maximum file size: **200KB**.

## Component Structure
The uploaded file should export a default component.

```tsx
import React from 'react'

export default function HackathonLanding({ competition, onRegister }) {
  return (
    <div>
      <h1>{competition.name}</h1>
      <button onClick={onRegister}>Join Now</button>
    </div>
  )
}
```

## Available Props
When the main SaaS app renders your component, it provides:
- `competition`: Object containing `name`, `description`, `start_date`, `end_date`.
- `user`: Current authenticated user (if any).
- `onRegister`: Function to trigger the platform's registration flow.

## Guidelines
- **Styling:** Use Tailwind CSS classes. The main app's tailwind configuration is available.
- **Restrictions:** Do not use `localStorage` or `cookies` directly. Use platform-provided hooks for state.
- **External Assets:** Use absolute URLs for images. Relative paths will not resolve correctly.

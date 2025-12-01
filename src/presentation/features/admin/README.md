# 🎛️ Admin Dashboard Usage

**Real-time agent monitoring and system management.**

## Quick Start

```tsx
import { AdminDashboard } from '@/features/admin';

// Add to your routes
<Route path="/admin" element={<AdminDashboard />} />
```

## Components

### AdminDashboard
Main container with tabs and auto-refresh.

### HealthPanel
Grid of agent status cards with summary statistics.

### AgentCard
Individual agent card with:
- Animated status badge
- Current task
- Last heartbeat
- Trigger button

### TerminalFeed
Live log aggregation with:
- Auto-scroll
- Export functionality
- Syntax highlighting

## Features

### Real-time Updates
- Auto-refresh every 5 seconds
- Polling GET /api/admin/agents-status
- Polling GET /api/admin/logs

### Manual Actions
- Trigger agents via button
- Refresh data manually
- Export logs to file
- Clear terminal

## API Integration

The dashboard uses these endpoints:

```
GET  /api/admin/agents-status  # All agents
GET  /api/admin/logs           # Aggregated logs
POST /api/admin/agents/:id/trigger  # Run agent
```

## Styling

Uses:
- TailwindCSS for styling
- Framer Motion for animations
- Lucide React for icons

## Example

```tsx
// Full page example
import { AdminDashboard } from '@/features/admin';

export function AdminPage() {
  return (
    <div className="min-h-screen">
      <AdminDashboard />
    </div>
  );
}
```

---

**Part of Project AEGIS 🛡️**

# Language Matrix - Protocol Babel

## Overview

The Language Matrix enables all PANTHEON agents to communicate in multiple languages with graceful fallback.

## Usage

### Basic Speech

```typescript
import { speak } from './language-matrix';

// Get a translated phrase
const message = speak('OLYMPUS', 'WAKE');
// FR: "🌌 Systèmes en éveil. Le Panthéon vous observe."
// EN: "🌌 Systems awakening. The Pantheon is watching."
```

### Speech with Variables

```typescript
import { speakWith } from './language-matrix';

const alert = speakWith('AEGIS', 'THREAT_DETECTED', 'SQL Injection');
// FR: "🔴 MENACE DÉTECTÉE : SQL Injection"
// EN: "🔴 THREAT DETECTED: SQL Injection"
```

### Change Language

```typescript
import { setLanguage } from './language-matrix';

setLanguage('fr'); // French (default)
setLanguage('en'); // English
```

## Agents & Keys

### OLYMPUS
- `WAKE` - System awakening message
- `ONLINE` - All systems operational
- `STATUS` - Status check
- `HEALTHY` / `DEGRADED` / `BROKEN` - Health states
- `SHUTDOWN` / `OFFLINE` - Shutdown messages

### AEGIS (Security)
- `INIT` - Initialization
- `SCAN_COMPLETE` - Scan finished
- `NO_THREATS` - No threats found
- `THREAT_DETECTED` - Threat alert (use speakWith)
- `FIREWALL_OK` - Firewall status

### HELIOS (Build/PDF)
- `BUILD_START` - Build started
- `BUILD_SUCCESS` / `BUILD_FAILED` - Build results
- `PDF_OPTIMIZE` - PDF optimization
- `LIQUID_GLASS` - Liquid Glass protocol
- `FONT_RENDER` - Font rendering

### NEXUS (Network)
- `API_VERIFIED` - API check passed
- `NETWORK_OK` - Network optimal
- `CONNECTIONS_STABLE` - Connections OK
- `DATA_SYNC` - Syncing data

### KAIROS (Time/Performance)
- `METRICS_OK` - Performance good
- `SCHEDULERS_SYNC` - Schedulers ready
- `CRON_EXECUTED` - Cron jobs done
- `FAST_RESPONSE` - Fast response time

### HERMES (Messenger)
- `SYNAPSE_FIRED` - Message sent
- `SYNAPSE_DELIVERED` - Message delivered
- `DEAD_LETTER` - Message failed
- `PRIORITY_*` - Priority levels

## Fallback Logic

1. Try current language (default: `fr`)
2. If key not found, try English (`en`)
3. If still not found, return `[AGENT] KEY`

## Example Integration

```typescript
// In OlympusCore
import { speak } from './language-matrix';

async awaken() {
    console.log(speak('OLYMPUS', 'AWAKENING'));
    // ...
    console.log(speak('OLYMPUS', 'ONLINE'));
}
```

```typescript
// In AegisGeneral
import { speak, speakWith } from './language-matrix';

async scan() {
    this.log(speak('AEGIS', 'SCAN_START'));
    
    if (threatsFound) {
        this.log(speakWith('AEGIS', 'THREAT_DETECTED', threatName));
    } else {
        this.log(speak('AEGIS', 'NO_THREATS'));
    }
}
```

## Adding New Phrases

1. Add to both `fr` and `en` objects
2. Use consistent keys across languages
3. Include emoji for visual context
4. Keep messages concise and clear

---

**🌐 Les dieux parlent toutes les langues.**

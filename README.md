# scheduled-claude-channel

A Claude Code custom channel that sends scheduled messages via MCP notifications.

## Installation

```bash
npm install -g scheduled-claude-channel
```

## Usage

Add to your Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "scheduler": {
      "command": "npx",
      "args": [
        "scheduled-claude-channel",
        "--schedule", "0 7 * * * おはよう",
        "--schedule", "0 8 * * 1 週次チェック"
      ]
    }
  }
}
```

## Schedule Format

```
--schedule "MIN HOUR DOM MON DOW MESSAGE"
```

Standard 5-field cron expression followed by the message text.

## Options

- `--schedule "CRON MESSAGE"` — Add a scheduled message (repeatable)
- `--timezone TIMEZONE` — Set timezone (default: `Asia/Tokyo`)
- `SCHEDULER_LOCK_PORT` — Override lock port env var (default: `18923`)

## Single-instance guarantee

Only one instance runs per machine. Additional instances started by subsequent Claude sessions exit silently.

## How it works

When a scheduled time fires, the channel sends the message text as a `notifications/claude/channel` MCP notification to the active Claude session. Claude processes it as a regular user message through its existing routine system.

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

## Multi-session support

Each Claude session gets its own scheduler. Define separate MCP entries in `.mcp.json` per session — each entry runs independently with its own cron jobs.

## How it works

When a scheduled time fires, the channel sends the message text as a `notifications/claude/channel` MCP notification to the active Claude session. Claude processes it as a regular user message through its existing routine system.

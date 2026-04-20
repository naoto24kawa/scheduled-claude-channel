import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export interface McpChannel {
  notify: (message: string) => Promise<void>
  onClose: (handler: () => void) => void
}

export async function startMcpServer(): Promise<McpChannel> {
  const mcp = new Server(
    { name: 'scheduled-claude-channel', version: '0.1.0' },
    {
      capabilities: {
        experimental: { 'claude/channel': {} },
      },
      instructions: [
        'スケジューラーからのメッセージは <channel source="scheduler"> タグで届く。',
        'メッセージをそのまま通常のユーザー入力として処理すること。',
      ].join('\n'),
    },
  )

  let closeHandler: (() => void) | null = null

  const transport = new StdioServerTransport()
  transport.onclose = () => {
    console.error('[scheduler] MCP transport closed')
    closeHandler?.()
  }

  await mcp.connect(transport)
  console.error('[scheduler] MCP server connected')

  return {
    notify: async (message: string) => {
      await mcp.notification({
        method: 'notifications/claude/channel',
        params: {
          content: message,
          meta: { source: 'scheduler' },
        },
      })
    },
    onClose: (handler) => {
      closeHandler = handler
    },
  }
}

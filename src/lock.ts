import net from 'node:net'

export interface LockResult {
  acquired: boolean
  release: () => void
}

export function acquireLock(port = 18923): Promise<LockResult> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.listen(port, '127.0.0.1', () => {
      resolve({
        acquired: true,
        release: () => {
          server.close((err) => {
            if (err) console.error('[scheduler] Failed to release lock:', err)
          })
        },
      })
    })

    server.on('error', (e: NodeJS.ErrnoException) => {
      if (e.code === 'EADDRINUSE') {
        resolve({ acquired: false, release: () => {} })
      } else {
        reject(e)
      }
    })
  })
}

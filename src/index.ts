#!/usr/bin/env node
import { parseScheduleArg, validateCron, startJobs, stopJobs } from './schedule.js'
import { startMcpServer } from './mcp.js'

function parseArgs(argv: string[]): { schedules: string[]; timezone: string } {
  const schedules: string[] = []
  let timezone = 'Asia/Tokyo'

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--schedule' && argv[i + 1]) {
      schedules.push(argv[++i])
    } else if (argv[i] === '--timezone' && argv[i + 1]) {
      timezone = argv[++i]
    }
  }
  return { schedules, timezone }
}

async function main() {
  const { schedules: rawSchedules, timezone } = parseArgs(process.argv)

  if (rawSchedules.length === 0) {
    console.error('[scheduler] No schedules defined. Use --schedule "MIN HOUR DOM MON DOW MESSAGE"')
    process.exit(1)
  }

  const parsed = rawSchedules.map((raw) => {
    const schedule = parseScheduleArg(raw)
    if (!validateCron(schedule.cron)) {
      console.error(`[scheduler] Invalid cron expression: "${schedule.cron}" in "${raw}"`)
      process.exit(1)
    }
    return schedule
  })

  const channel = await startMcpServer()

  const jobs = startJobs(parsed, channel.notify, timezone)
  console.error(`[scheduler] ${jobs.length} schedule(s) registered (timezone: ${timezone})`)
  for (const s of parsed) {
    console.error(`[scheduler]   "${s.cron}" → "${s.message}"`)
  }

  const shutdown = (() => {
    let called = false
    return () => {
      if (called) return
      called = true
      console.error('[scheduler] Shutting down')
      stopJobs(jobs)
      process.exit(0)
    }
  })()

  channel.onClose(shutdown)
  process.stdin.on('end', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main().catch((e) => {
  console.error('[scheduler] Fatal error:', e)
  process.exit(1)
})

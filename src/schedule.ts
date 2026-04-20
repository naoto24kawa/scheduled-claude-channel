import cron from 'node-cron'

export interface ParsedSchedule {
  cron: string
  message: string
}

export function parseScheduleArg(arg: string): ParsedSchedule {
  const parts = arg.trim().split(/\s+/)
  if (parts.length < 6) {
    throw new Error(
      `Invalid --schedule format: "${arg}". Expected "MIN HOUR DOM MON DOW MESSAGE"`,
    )
  }
  const cronExpr = parts.slice(0, 5).join(' ')
  const message = parts.slice(5).join(' ')
  if (!message) {
    throw new Error(`Missing message in --schedule: "${arg}"`)
  }
  return { cron: cronExpr, message }
}

export function validateCron(expr: string): boolean {
  return cron.validate(expr)
}

export function startJobs(
  schedules: ParsedSchedule[],
  send: (message: string) => Promise<void>,
  timezone = 'Asia/Tokyo',
): cron.ScheduledTask[] {
  return schedules.map(({ cron: expr, message }) =>
    cron.schedule(
      expr,
      async () => {
        try {
          await send(message)
        } catch (e) {
          console.error(`[scheduler] notification failed for "${message}":`, e)
        }
      },
      { timezone },
    ),
  )
}

export function stopJobs(jobs: cron.ScheduledTask[]): void {
  for (const job of jobs) job.stop()
}

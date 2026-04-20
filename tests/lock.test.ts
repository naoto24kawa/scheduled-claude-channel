import { describe, it, expect, afterEach } from 'bun:test'
import { acquireLock } from '../src/lock'

const TEST_PORT = 19923

describe('acquireLock', () => {
  const releases: Array<() => void> = []

  afterEach(() => {
    for (const release of releases) release()
    releases.length = 0
  })

  it('ポートが空いているとき true を返す', async () => {
    const result = await acquireLock(TEST_PORT)
    expect(result.acquired).toBe(true)
    releases.push(result.release)
  })

  it('ポートが使用中のとき false を返す', async () => {
    const first = await acquireLock(TEST_PORT)
    expect(first.acquired).toBe(true)
    releases.push(first.release)

    const second = await acquireLock(TEST_PORT)
    expect(second.acquired).toBe(false)
    releases.push(second.release)
  })

  it('release 後に再び acquire できる', async () => {
    const first = await acquireLock(TEST_PORT)
    expect(first.acquired).toBe(true)
    first.release()

    // ポート解放を待つ (最大200ms)
    let second = await acquireLock(TEST_PORT)
    let attempts = 0
    while (!second.acquired && attempts < 9) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      second.release()
      second = await acquireLock(TEST_PORT)
      attempts++
    }
    expect(second.acquired).toBe(true)
    releases.push(second.release)
  })
})

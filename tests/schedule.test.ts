import { describe, it, expect } from 'bun:test'
import { parseScheduleArg, validateCron } from '../src/schedule'

describe('parseScheduleArg', () => {
  it('5フィールドのcronとメッセージをパースする', () => {
    const result = parseScheduleArg('0 7 * * * おはよう')
    expect(result).toEqual({ cron: '0 7 * * *', message: 'おはよう' })
  })

  it('メッセージにスペースが含まれる場合も正しくパースする', () => {
    const result = parseScheduleArg('0 8 * * 1 設備 チェック')
    expect(result).toEqual({ cron: '0 8 * * 1', message: '設備 チェック' })
  })

  it('cronフィールドが5未満のとき例外を投げる', () => {
    expect(() => parseScheduleArg('0 7 * * おはよう')).toThrow()
  })

  it('メッセージが空のとき例外を投げる', () => {
    expect(() => parseScheduleArg('0 7 * * *')).toThrow()
  })
})

describe('validateCron', () => {
  it('有効なcron式でtrueを返す', () => {
    expect(validateCron('0 7 * * *')).toBe(true)
    expect(validateCron('0 8 * * 1')).toBe(true)
    expect(validateCron('*/10 * * * *')).toBe(true)
  })

  it('無効なcron式でfalseを返す', () => {
    expect(validateCron('99 7 * * *')).toBe(false)
    expect(validateCron('not a cron')).toBe(false)
  })
})

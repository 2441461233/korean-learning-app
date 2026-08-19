import type { BackupPayload } from './types'

export function serializeBackup(payload: Omit<BackupPayload, 'version' | 'exportedAt'>): string {
  const body: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    ...payload,
  }
  return JSON.stringify(body, null, 2)
}

export function parseBackup(text: string): BackupPayload {
  const data = JSON.parse(text) as BackupPayload
  if (data.version !== 1 || !Array.isArray(data.words) || !Array.isArray(data.books)) {
    throw new Error('备份文件格式不正确')
  }
  return data
}

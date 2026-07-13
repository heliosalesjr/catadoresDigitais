import { NextRequest } from 'next/server'
import { autoArchiveExpiredTurmas } from '@/lib/turma-archive'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const archivedCount = await autoArchiveExpiredTurmas()
  return Response.json({ ok: true, archivedCount })
}

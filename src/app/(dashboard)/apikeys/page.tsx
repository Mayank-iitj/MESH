import { prisma } from '@/lib/prisma'
import ApiKeyClient from './ApiKeyClient'

export default async function ApiKeysPage() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
        <p className="text-muted-foreground mt-1">
          Manage access tokens for your external autonomous agents.
        </p>
      </header>

      <ApiKeyClient apiKeys={keys} />
    </div>
  )
}

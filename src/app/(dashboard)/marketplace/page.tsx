import { prisma } from '@/lib/prisma'
import MarketplaceClient from './MarketplaceClient'

export default async function MarketplacePage() {
  const providers = await prisma.provider.findMany()

  return (
    <MarketplaceClient installedProviders={providers} />
  )
}

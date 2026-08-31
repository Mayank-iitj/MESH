'use client'

import { useState } from 'react'
import { approveTransaction, rejectTransaction } from '@/app/actions/transactions'
import { Button } from "@/components/ui/button"

export default function TransactionActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await approveTransaction(id)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await rejectTransaction(id)
    setLoading(false)
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
        onClick={handleApprove}
        disabled={loading}
      >
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
        onClick={handleReject}
        disabled={loading}
      >
        Reject
      </Button>
    </div>
  )
}

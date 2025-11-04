"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DeleteTransactionButtonProps {
  transactionId: string
}

export function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    setIsDeleting(true)

    try {
      if (!transactionId) {
        // Defensive: prevent calling API with an undefined id which leads to DB errors
        alert("Missing transaction id. Cannot delete.")
        console.error("DeleteTransactionButton: missing transactionId", { transactionId })
        setIsDeleting(false)
        return
      }

      console.debug("DeleteTransactionButton: deleting id", transactionId)
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete transaction")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:text-gray-400"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  )
}

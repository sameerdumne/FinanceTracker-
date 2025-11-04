"use client"

import { useState } from "react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { DeleteTransactionButton } from "./delete-transaction-button"
import { EditTransactionModal } from "./edit-transaction-modal"

interface Transaction {
  id: string
  user_id: string
  type: "income" | "expense" | "lending" | "borrowing"
  amount: number
  description: string
  date: string
  created_at: string
}

const typeColors: Record<string, string> = {
  income: "bg-green-100 text-green-800",
  expense: "bg-red-100 text-red-800",
  lending: "bg-orange-100 text-orange-800",
  borrowing: "bg-purple-100 text-purple-800",
}

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found. Add your first transaction to get started!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
            <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
            <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{formatDate(transaction.date)}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[transaction.type]}`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{transaction.description}</td>
              <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(transaction.amount)}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setEditingId(transaction.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <DeleteTransactionButton transactionId={transaction.id} />
                </div>
                {editingId === transaction.id && (
                  <EditTransactionModal transaction={transaction} onClose={() => setEditingId(null)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

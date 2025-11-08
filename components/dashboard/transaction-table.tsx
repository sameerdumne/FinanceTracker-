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
  borrower_email?: string | null
  last_reminder_sent_at?: string | null
  reminder_count?: number
}

const typeColors: Record<string, string> = {
  income: "bg-green-100 text-green-800",
  expense: "bg-red-100 text-red-800",
  lending: "bg-orange-100 text-orange-800",
  borrowing: "bg-purple-100 text-purple-800",
}

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(new Set())

  console.log('📋 TransactionTable received:', transactions)

  const handleSendReminder = async (transaction: Transaction) => {
    if (!transaction.borrower_email) {
      alert("No borrower email found for this transaction. Please edit the transaction to add an email.")
      return
    }

    setSendingReminders(prev => new Set(prev).add(transaction.id))

    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionId: transaction.id,
          borrowerEmail: transaction.borrower_email
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Reminder sent successfully! Total reminders sent: ${result.reminderCount}`)
        window.location.reload()
      } else {
        alert('Failed to send reminder: ' + result.error)
      }
    } catch (error) {
      alert('Error sending reminder. Please try again.')
      console.error('Error sending reminder:', error)
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev)
        newSet.delete(transaction.id)
        return newSet
      })
    }
  }

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
              <td className="px-4 py-3 text-sm">
                <div>
                  {transaction.description}
                  {/* Show reminder info for borrowing transactions */}
                  {transaction.type === 'borrowing' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.borrower_email ? (
                        <>
                          📧 {transaction.borrower_email}
                          {(transaction.reminder_count || 0) > 0 && (
                            <span className="ml-2">
                              • Reminders: {transaction.reminder_count}
                              {transaction.last_reminder_sent_at && (
                                <span> • Last: {formatDate(transaction.last_reminder_sent_at)}</span>
                              )}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-orange-600">⚠️ No email set</span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(transaction.amount)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setEditingId(transaction.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <DeleteTransactionButton transactionId={transaction.id} />
                  </div>
                  
                  {/* Send Reminder Button - Only for borrowing transactions with email */}
                  {transaction.type === 'borrowing' && transaction.borrower_email && (
                    <button
                      onClick={() => handleSendReminder(transaction)}
                      disabled={sendingReminders.has(transaction.id)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        sendingReminders.has(transaction.id)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {sendingReminders.has(transaction.id) ? 'Sending...' : '📧 Send Reminder'}
                    </button>
                  )}

                  {/* Warning for borrowing transactions without email */}
                  {transaction.type === 'borrowing' && !transaction.borrower_email && (
                    <div className="text-xs text-orange-600 text-center">
                      ⚠️ No email set
                    </div>
                  )}
                </div>
                
                {editingId === transaction.id && (
                  <EditTransactionModal 
                    transaction={transaction} 
                    onClose={() => setEditingId(null)} 
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
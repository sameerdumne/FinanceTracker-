"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface AddTransactionFormProps {
  userId: string
  onSuccess: () => void
}

export function AddTransactionForm({ userId, onSuccess }: AddTransactionFormProps) {
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [borrowerEmail, setBorrowerEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const transactionData: any = {
        type,
        amount: Number.parseFloat(amount),
        description,
        date,
        user_id: userId,
      }

      // ⚠️ CRITICAL: ALWAYS include borrower_email for borrowing transactions
      if (type === "borrowing") {
        transactionData.borrower_email = borrowerEmail
      }

      console.log('📤 Sending to API:', transactionData)

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add transaction")
      }

      const result = await response.json()
      console.log('✅ API Response:', result)

      // Reset form
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      setBorrowerEmail("")
      setType("expense")
      onSuccess()
      router.refresh()
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              if (e.target.value !== "borrowing") {
                setBorrowerEmail("")
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="lending">Lending</option>
            <option value="borrowing">Borrowing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      {/* Borrower Email Field - Only show for borrowing transactions */}
      {type === "borrowing" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Borrower Email (for reminders) *
          </label>
          <input
            type="email"
            value={borrowerEmail}
            onChange={(e) => setBorrowerEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter borrower's email address"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for borrowing transactions. We'll send reminder emails to this address.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
      >
        {isLoading ? "Adding..." : "Add Transaction"}
      </button>
    </form>
  )
}
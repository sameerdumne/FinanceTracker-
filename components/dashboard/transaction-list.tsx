"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTransactionForm } from "./add-transaction-form"
import { TransactionFilters } from "./transaction-filters"
import { TransactionTable } from "./transaction-table"

interface Transaction {
  id: string
  user_id: string
  type: "income" | "expense" | "lending" | "borrowing"
  amount: number
  description: string
  date: string
  created_at: string
}

export function TransactionList({ transactions, userId }: { transactions: Transaction[]; userId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = !filterType || t.type === filterType
    const matchesDateStart = !dateRange.start || new Date(t.date) >= new Date(dateRange.start)
    const matchesDateEnd = !dateRange.end || new Date(t.date) <= new Date(dateRange.end)
    return matchesType && matchesDateStart && matchesDateEnd
  })

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transactions</CardTitle>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Transaction"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <AddTransactionForm
            userId={userId}
            onSuccess={() => {
              setShowForm(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}
        <TransactionFilters onFilterChange={setFilterType} onDateRangeChange={setDateRange} />
        <TransactionTable transactions={filteredTransactions} />
      </CardContent>
    </Card>
  )
}

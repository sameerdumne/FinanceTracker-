import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  type: "income" | "expense" | "lending" | "borrowing"
  amount: number
  date: string
}

export function DashboardOverview({ transactions }: { transactions: Transaction[] }) {
  const stats = {
    totalIncome: transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0),
    totalLent: transactions.filter((t) => t.type === "lending").reduce((sum, t) => sum + Number(t.amount), 0),
    totalBorrowed: transactions.filter((t) => t.type === "borrowing").reduce((sum, t) => sum + Number(t.amount), 0),
  }

  const balance = stats.totalIncome - stats.totalExpense + stats.totalBorrowed - stats.totalLent

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Amount Lent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{formatCurrency(stats.totalLent)}</div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Amount Borrowed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalBorrowed)}</div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

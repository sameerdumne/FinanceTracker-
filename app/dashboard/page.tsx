import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardOverview } from "@/components/dashboard/overview"
import { TransactionList } from "@/components/dashboard/transaction-list"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch all transactions for the user
  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select("id, user_id, type, amount, description, date, created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (transactionError) {
    console.error("Error fetching transactions:", transactionError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Where is my monnney ?</h1>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Dashboard Overview */}
        <div className="mb-8">
          <DashboardOverview transactions={transactions || []} />
        </div>

        {/* Transaction List */}
        <div>
          <TransactionList transactions={transactions || []} userId={user.id} />
        </div>
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, description, date, borrower_email } = body

    console.log('🔍 API Received:', { type, amount, description, date, borrower_email })

    if (!type || !amount || !description || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prepare transaction data
    const transactionData: any = {
      user_id: user.id,
      type,
      amount,
      description,
      date,
    }

    // ALWAYS handle borrower_email for borrowing transactions
    if (type === 'borrowing') {
      console.log('🔍 Processing borrowing transaction with email:', borrower_email)
      
      if (borrower_email && borrower_email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(borrower_email)) {
          return NextResponse.json({ 
            error: "Invalid email format for borrower email" 
          }, { status: 400 })
        }
        transactionData.borrower_email = borrower_email
      } else {
        transactionData.borrower_email = ''
      }
      transactionData.reminder_count = 0
    } else {
      transactionData.borrower_email = null
    }

    console.log('🔍 Final data to insert:', transactionData)

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select('*') // ⚠️ CRITICAL: Select ALL fields including borrower_email

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Insert successful:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Server error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
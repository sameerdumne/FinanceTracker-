import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendBorrowerReminder } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId, borrowerEmail } = await request.json();

    if (!transactionId || !borrowerEmail) {
      return NextResponse.json({ 
        error: 'Transaction ID and borrower email are required' 
      }, { status: 400 });
    }

    console.log('Sending reminder for transaction:', transactionId, 'to:', borrowerEmail);

    // Fetch transaction details
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (error || !transaction) {
      console.error('Transaction not found:', error);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.type !== 'borrowing') {
      return NextResponse.json({ error: 'Not a borrowing transaction' }, { status: 400 });
    }

    // Send reminder email
    const emailResult = await sendBorrowerReminder({
      borrowerEmail: borrowerEmail,
      borrowerName: 'Borrower', // You might want to store names
      lenderName: user.user_metadata?.name || user.email || 'Lender',
      amount: transaction.amount,
      borrowDate: new Date(transaction.date).toLocaleDateString('en-IN'),
      description: transaction.description,
      transactionId: transaction.id
    });

    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send email: ' + emailResult.error 
      }, { status: 500 });
    }

    // Update transaction with reminder info
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        last_reminder_sent_at: new Date().toISOString(),
        reminder_count: (transaction.reminder_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating reminder count:', updateError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reminder sent successfully',
      reminderCount: (transaction.reminder_count || 0) + 1,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
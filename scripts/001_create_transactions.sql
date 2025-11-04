-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'lending', 'borrowing')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions table
-- Allow users to select their own transactions
CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own transactions
CREATE POLICY "transactions_update_own"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own transactions
CREATE POLICY "transactions_delete_own"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS transactions_user_id_date_idx 
  ON public.transactions(user_id, date DESC);

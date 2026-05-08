CREATE POLICY "mandi_prices auth insert" ON public.mandi_prices
FOR INSERT TO authenticated WITH CHECK (true);
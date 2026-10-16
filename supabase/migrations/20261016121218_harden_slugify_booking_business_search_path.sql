-- This function is not SECURITY DEFINER and is not granted to public roles,
-- but fixing its search path keeps the database-function security baseline
-- explicit and removes the Advisor warning.
ALTER FUNCTION public.slugify_booking_business(text)
  SET search_path = '';

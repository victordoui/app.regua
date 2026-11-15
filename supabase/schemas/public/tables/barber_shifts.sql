CREATE TABLE "public"."barber_shifts" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       uuid                     NOT NULL,
  "barber_id"     uuid                     NOT NULL,
  "day_of_week"   integer,
  "specific_date" date,
  "start_time"    time without time zone   NOT NULL,
  "end_time"      time without time zone   NOT NULL,
  "is_recurring"  boolean                  NOT NULL DEFAULT true,
  "break_start"   time without time zone,
  "break_end"     time without time zone,
  "status"        text                     NOT NULL DEFAULT 'active'::text,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "barber_shifts_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
  CONSTRAINT "barber_shifts_pkey" PRIMARY KEY (id),
  CONSTRAINT "barber_shifts_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))),
  CONSTRAINT "recurring_or_specific" CHECK ((((is_recurring = true) AND (day_of_week IS NOT NULL) AND (specific_date IS NULL)) OR ((is_recurring = false) AND (specific_date IS
    NOT NULL) AND (day_of_week IS NULL)))),
  CONSTRAINT "valid_break_times" CHECK ((((break_start IS NULL) AND (break_end IS NULL)) OR ((break_start IS NOT NULL) AND (break_end IS
    NOT NULL) AND (break_start < break_end) AND (break_start >= start_time) AND (break_end <= end_time)))),
  CONSTRAINT "valid_shift_times" CHECK ((start_time < end_time))
);

ALTER TABLE "public"."barber_shifts"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_barber_shifts_barber ON public.barber_shifts USING btree (barber_id);

CREATE INDEX idx_barber_shifts_date ON public.barber_shifts USING btree (specific_date)
  WHERE (specific_date IS NOT NULL);

CREATE INDEX idx_barber_shifts_day ON public.barber_shifts USING btree (day_of_week)
  WHERE (is_recurring = true);

CREATE INDEX idx_barber_shifts_user ON public.barber_shifts USING btree (user_id);

CREATE UNIQUE INDEX idx_unique_recurring_shift ON public.barber_shifts USING btree (user_id, barber_id, day_of_week)
  WHERE ((is_recurring = true) AND (status = 'active'::text));

CREATE TRIGGER update_barber_shifts_updated_at
  BEFORE UPDATE ON public.barber_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can delete their barber shifts" ON "public"."barber_shifts"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their barber shifts" ON "public"."barber_shifts"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their barber shifts" ON "public"."barber_shifts"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their barber shifts" ON "public"."barber_shifts"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."barber_shifts" TO "authenticated", "postgres", "service_role";

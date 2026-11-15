-- Run only after the function and migration have been released.
-- Store these secrets in Supabase Vault first:
--   vizzu_project_url
--   vizzu_server_key
--   vizzu_reminder_cron_secret
-- Configure the same vizzu_reminder_cron_secret as the Edge Function secret
-- REMINDER_CRON_SECRET. Never put secret values in this file or Git.
--
-- The request uses the project's server-side key in pg_net's request headers.
-- Supabase documents that queued requests briefly retain decrypted headers;
-- restrict database access and use the least-privileged supported server key.

select cron.unschedule(jobid)
from cron.job
where jobname = 'send-appointment-reminders-every-five-minutes';

select cron.schedule(
  'send-appointment-reminders-every-five-minutes',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'vizzu_project_url'
      ) || '/functions/v1/send-appointment-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'vizzu_server_key'
        ),
        'Authorization', 'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'vizzu_server_key'
        ),
        'x-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'vizzu_reminder_cron_secret'
        )
      ),
      body := '{}'::jsonb
    ) as request_id;
  $job$
);

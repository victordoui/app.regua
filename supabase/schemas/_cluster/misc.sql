SELECT cron.schedule_in_database('atualizar', '0 0 * * *', 'insert into atualizar(numero) values(1);', 'postgres', NULL, true);

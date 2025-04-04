DO $$ 
DECLARE 
    tables CURSOR FOR
        SELECT tablename
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public';
BEGIN
    FOR t IN tables LOOP
        EXECUTE 'TRUNCATE TABLE "' || t.tablename || '" CASCADE';
    END LOOP;
END $$;
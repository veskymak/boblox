-- One-time recovery email enrollment for accounts existing at deployment.
CREATE TABLE boblox_private.email_enrollment (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 dismissed_at timestamptz,
 target_email text
);
ALTER TABLE boblox_private.email_enrollment ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON boblox_private.email_enrollment FROM PUBLIC, anon, authenticated;
INSERT INTO boblox_private.email_enrollment(user_id) SELECT id FROM auth.users;

CREATE FUNCTION public.recovery_email_status(dismiss boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE uid uuid:=auth.uid(); state boblox_private.email_enrollment;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF dismiss THEN UPDATE boblox_private.email_enrollment SET dismissed_at=coalesce(dismissed_at,now()) WHERE user_id=uid; END IF;
 SELECT * INTO state FROM boblox_private.email_enrollment WHERE user_id=uid;
 RETURN jsonb_build_object('showPrompt',state.user_id IS NOT NULL AND state.dismissed_at IS NULL AND state.target_email IS NULL);
END $$;
REVOKE ALL ON FUNCTION public.recovery_email_status(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recovery_email_status(boolean) TO authenticated;

CREATE FUNCTION boblox_private.guard_recovery_email() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE state boblox_private.email_enrollment; candidate text;
BEGIN
 IF TG_OP='INSERT' THEN
  IF coalesce(NEW.email,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR lower(NEW.email) LIKE '%@boblox.cz' THEN
   RAISE EXCEPTION 'A real email address is required' USING ERRCODE='22023';
  END IF;
  RETURN NEW;
 END IF;
 IF NEW.email IS NOT DISTINCT FROM OLD.email AND coalesce(NEW.email_change,'')=coalesce(OLD.email_change,'') THEN RETURN NEW; END IF;
 SELECT * INTO state FROM boblox_private.email_enrollment WHERE user_id=OLD.id FOR UPDATE;
 -- Confirming the already chosen address is allowed; choosing a different address is not.
 IF state.target_email IS NOT NULL THEN
  IF (NEW.email IS DISTINCT FROM OLD.email AND lower(NEW.email)<>state.target_email)
    OR (coalesce(NEW.email_change,'')<>'' AND lower(NEW.email_change)<>state.target_email) THEN
   RAISE EXCEPTION 'Email can only be added once' USING ERRCODE='42501';
  END IF;
 ELSIF state.user_id IS NULL OR state.dismissed_at IS NOT NULL THEN
  RAISE EXCEPTION 'Email enrollment is no longer available' USING ERRCODE='42501';
 ELSE
  candidate:=lower(coalesce(nullif(NEW.email_change,''),NEW.email));
  IF candidate !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR candidate LIKE '%@boblox.cz' THEN
   RAISE EXCEPTION 'Invalid recovery email' USING ERRCODE='22023';
  END IF;
  UPDATE boblox_private.email_enrollment SET target_email=candidate,dismissed_at=now() WHERE user_id=OLD.id;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION boblox_private.guard_recovery_email() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER boblox_recovery_email BEFORE INSERT OR UPDATE OF email,email_change ON auth.users
FOR EACH ROW EXECUTE FUNCTION boblox_private.guard_recovery_email();

-- Resolve names only inside the login function; never expose account email addresses to browsers.
CREATE FUNCTION public.account_login_email(login_name text) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT u.email FROM auth.users u JOIN public.profiles p ON p.id=u.id
 WHERE lower(p.username)=lower(login_name)
$$;
REVOKE ALL ON FUNCTION public.account_login_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_login_email(text) TO service_role;

-- Preserve the current command implementation and change only new profile creation eligibility.
DO $migration$
DECLARE definition text;
BEGIN
 definition:=pg_get_functiondef('public.account_command(text,jsonb,uuid)'::regprocedure);
 IF position('lower(email)=lower(payload->>''username'')||''@boblox.cz''' IN definition)=0 THEN
  RAISE EXCEPTION 'Unexpected account_command registration implementation';
 END IF;
 definition:=replace(definition,
  'lower(email)=lower(payload->>''username'')||''@boblox.cz''',
  'email_confirmed_at IS NOT NULL AND email NOT LIKE ''%@boblox.cz'' AND NOT EXISTS(SELECT 1 FROM boblox_private.email_enrollment e WHERE e.user_id=uid)');
 EXECUTE definition;
END $migration$;

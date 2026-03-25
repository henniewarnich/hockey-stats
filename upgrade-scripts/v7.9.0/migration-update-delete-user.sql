-- v7.9.0: Update delete_user to handle new FK columns

CREATE OR REPLACE FUNCTION delete_user(p_id UUID)
RETURNS void AS $$
BEGIN
  -- Log it
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'delete_user', 'user', p_id, (
    SELECT jsonb_build_object('email', email, 'firstname', firstname, 'lastname', lastname, 'role', role)
    FROM profiles WHERE id = p_id
  ));

  -- Clear FK references in matches
  UPDATE public.matches SET submitted_by = NULL WHERE submitted_by = p_id;
  UPDATE public.matches SET approved_by = NULL WHERE approved_by = p_id;
  UPDATE public.matches SET created_by = NULL WHERE created_by = p_id;
  UPDATE public.matches SET locked_by = NULL WHERE locked_by = p_id;

  -- Clear FK references in teams
  UPDATE public.teams SET suggested_by = NULL WHERE suggested_by = p_id;

  -- Clear audit log references (set to NULL, keep log entries)
  UPDATE public.audit_log SET user_id = NULL WHERE user_id = p_id;

  -- Clear reactions and viewers
  DELETE FROM public.event_reactions WHERE viewer_id = p_id::text;
  DELETE FROM public.match_viewers WHERE viewer_id = p_id::text;

  -- Clear assignments
  DELETE FROM public.coach_teams WHERE coach_id = p_id;
  DELETE FROM public.match_commentators WHERE commentator_id = p_id;

  -- Delete profile and auth user
  DELETE FROM public.profiles WHERE id = p_id;
  DELETE FROM auth.users WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

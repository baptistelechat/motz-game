CREATE OR REPLACE FUNCTION toggle_vote(p_submission_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_votes TEXT[];
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current votes
  SELECT votes INTO v_votes
  FROM submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Initialize if null
  IF v_votes IS NULL THEN
    v_votes := ARRAY[]::TEXT[];
  END IF;

  -- Toggle vote
  IF v_user_id::text = ANY(v_votes) THEN
    -- Remove
    v_votes := array_remove(v_votes, v_user_id::text);
  ELSE
    -- Add
    v_votes := v_votes || v_user_id::text;
  END IF;

  -- Update
  UPDATE submissions
  SET votes = v_votes
  WHERE id = p_submission_id;
END;
$$;

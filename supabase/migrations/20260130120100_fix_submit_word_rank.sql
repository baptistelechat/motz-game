CREATE OR REPLACE FUNCTION public.submit_word(p_game_id uuid, p_round_id uuid, p_player_id uuid, p_word text, p_base_score integer, p_letter_details jsonb, p_is_valid boolean, p_rejection_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_rank INT;
    v_speed_bonus INT := 0;
    v_total_score INT := 0;
    v_last_submission RECORD;
    v_points_details JSONB;
    v_submission_id UUID;
    v_created_at TIMESTAMPTZ := now();
BEGIN
    -- If invalid, just insert and return
    IF NOT p_is_valid THEN
        INSERT INTO public.submissions (
            game_id, round_id, player_id, word, score, points_details, is_valid, rejection_reason, created_at
        ) VALUES (
            p_game_id, p_round_id, p_player_id, p_word, 0, NULL, false, p_rejection_reason, v_created_at
        ) RETURNING id INTO v_submission_id;

        RETURN jsonb_build_object(
            'id', v_submission_id,
            'is_valid', false,
            'rejection_reason', p_rejection_reason
        );
    END IF;

    -- Lock round for update to prevent race conditions on ranking
    PERFORM 1 FROM public.rounds WHERE id = p_round_id FOR UPDATE;

    -- Check round status
    IF NOT EXISTS (SELECT 1 FROM public.rounds WHERE id = p_round_id AND status = 'PLAYING') THEN
        RAISE EXCEPTION 'Round is not playing';
    END IF;

    -- Calculate Rank based on COUNT of existing valid submissions
    -- This is more robust than relying on SELECT INTO
    SELECT COUNT(*) + 1 INTO v_rank
    FROM public.submissions
    WHERE round_id = p_round_id AND is_valid = true;

    -- Check for tie breaker (50ms window)
    SELECT * INTO v_last_submission
    FROM public.submissions
    WHERE round_id = p_round_id AND is_valid = true
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_last_submission IS NOT NULL THEN
        IF v_created_at - v_last_submission.created_at < interval '50 milliseconds' THEN
            -- Tie breaker: same rank as previous
            v_rank := (v_last_submission.points_details->>'rank')::INT;
        END IF;
    END IF;

    -- Calculate Speed Bonus
    -- 1st: 10, 2nd: 8, 3rd: 5, 4th: 3, 5th: 1, 6+: 0
    IF v_rank = 1 THEN v_speed_bonus := 10;
    ELSIF v_rank = 2 THEN v_speed_bonus := 8;
    ELSIF v_rank = 3 THEN v_speed_bonus := 5;
    ELSIF v_rank = 4 THEN v_speed_bonus := 3;
    ELSIF v_rank = 5 THEN v_speed_bonus := 1;
    ELSE v_speed_bonus := 0;
    END IF;

    -- Total Score
    v_total_score := p_base_score + v_speed_bonus;

    -- Construct points_details
    v_points_details := jsonb_build_object(
        'word_score', p_base_score,
        'speed_bonus', v_speed_bonus,
        'total_score', v_total_score,
        'letters', p_letter_details,
        'rank', v_rank
    );

    -- Insert
    INSERT INTO public.submissions (
        game_id, round_id, player_id, word, score, points_details, is_valid, created_at
    ) VALUES (
        p_game_id, p_round_id, p_player_id, p_word, v_total_score, v_points_details, true, v_created_at
    ) RETURNING id INTO v_submission_id;

    RETURN jsonb_build_object(
        'id', v_submission_id,
        'is_valid', true,
        'score', v_total_score,
        'rank', v_rank,
        'speed_bonus', v_speed_bonus,
        'word_score', p_base_score
    );
END;
$function$

-- Helper function to generate constraints
CREATE OR REPLACE FUNCTION public.generate_round_constraints()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_imposed_letter CHAR(1);
    v_forbidden_letter CHAR(1);
    v_theme TEXT;
    v_card_type TEXT;
    v_card_value INT;
    v_card_types TEXT[] := ARRAY[
        'free', 'min_len', 'max_len', 'exact_len', 
        'starts_with_imposed', 'ends_with_imposed', 
        'unique_chars', 'min_vowels', 'invert_letters',
        'theme'
    ];
BEGIN
    -- Random imposed letter A-Z (ASCII 65-90)
    v_imposed_letter := chr(65 + floor(random() * 26)::int);
    
    -- Random forbidden letter A-Z, distinct from imposed
    LOOP
        v_forbidden_letter := chr(65 + floor(random() * 26)::int);
        EXIT WHEN v_forbidden_letter != v_imposed_letter;
    END LOOP;
    
    -- Generate Constraint Card
    v_card_type := v_card_types[1 + floor(random() * array_length(v_card_types, 1))::int];
    
    -- Assign value based on type
    v_theme := NULL;
    v_card_value := NULL;

    IF v_card_type = 'min_len' THEN
        v_card_value := 4 + floor(random() * 5)::int; -- 4 to 8
    ELSIF v_card_type = 'max_len' THEN
        v_card_value := 6 + floor(random() * 5)::int; -- 6 to 10
    ELSIF v_card_type = 'exact_len' THEN
        v_card_value := 5 + floor(random() * 4)::int; -- 5 to 8
    ELSIF v_card_type = 'min_vowels' THEN
        v_card_value := 2 + floor(random() * 3)::int; -- 2 to 4
    ELSIF v_card_type = 'theme' THEN
        -- Random theme from themes table
        SELECT label INTO v_theme
        FROM public.themes
        WHERE locale = 'fr' -- Default to French for now
        ORDER BY random()
        LIMIT 1;

        -- Fallback if table is empty
        IF v_theme IS NULL THEN
            v_theme := 'Général';
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'imposed_letter', v_imposed_letter,
        'forbidden_letter', v_forbidden_letter,
        'theme', v_theme,
        'constraint_card', jsonb_build_object(
            'type', v_card_type,
            'value', v_card_value
        )
    );
END;
$$;

-- Updated start_new_round using the helper
CREATE OR REPLACE FUNCTION public.start_new_round(p_game_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_game_status public.game_status;
    v_host_id UUID;
    v_round_number INT;
    v_new_round_id UUID;
    v_constraints JSONB;
BEGIN
    -- 1. Check if game exists and user is host
    SELECT status, host_id INTO v_game_status, v_host_id
    FROM public.games
    WHERE id = p_game_id;

    IF v_game_status IS NULL THEN
        RAISE EXCEPTION 'Game not found';
    END IF;

    IF v_host_id != auth.uid() THEN
        RAISE EXCEPTION 'Only host can start a new round';
    END IF;

    -- 2. Update game status if needed (LOBBY -> PLAYING)
    IF v_game_status = 'LOBBY' THEN
        UPDATE public.games 
        SET status = 'PLAYING', started_at = now() 
        WHERE id = p_game_id;
    END IF;

    -- 3. Determine round number
    SELECT COALESCE(MAX(round_number), 0) + 1 INTO v_round_number
    FROM public.rounds
    WHERE game_id = p_game_id;

    -- 4. Generate constraints using helper
    v_constraints := public.generate_round_constraints();

    -- 5. Create round
    INSERT INTO public.rounds (game_id, round_number, constraints, status)
    VALUES (
        p_game_id, 
        v_round_number, 
        v_constraints,
        'PLAYING'
    )
    RETURNING id INTO v_new_round_id;

    RETURN jsonb_build_object(
        'id', v_new_round_id, 
        'round_number', v_round_number,
        'constraints', v_constraints
    );
END;
$$;

-- New Debug RPC to regenerate constraints for a specific round
CREATE OR REPLACE FUNCTION public.debug_regenerate_round_constraints(p_round_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_constraints JSONB;
BEGIN
    -- Generate new constraints
    v_constraints := public.generate_round_constraints();

    -- Update the round
    UPDATE public.rounds
    SET constraints = v_constraints
    WHERE id = p_round_id;

    RETURN v_constraints;
END;
$$;

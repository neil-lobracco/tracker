SELECT ee.score as score, lm.player_id as player_id 
    FROM elo_entries ee INNER JOIN
        (SELECT MAX(created_at) AS created_at, league_membership_id FROM elo_entries GROUP BY league_membership_id) ee2
        ON ee.created_at = ee2.created_at AND ee.league_membership_id = ee2.league_membership_id
    INNER JOIN league_memberships lm ON lm.id = ee.league_membership_id
    WHERE lm.player_id = ANY($1)
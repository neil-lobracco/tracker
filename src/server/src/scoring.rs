pub fn get_new_scores(player1_elo: f64, player2_elo: f64, player1_score: f64, player2_score: f64) -> (f64, f64) {
    let r1 = player1_elo;
    let r2 = player2_elo;
    let e1 = 1_f64 / (1_f64 + (10_f64.powf((r2 - r1) / 400_f64)));
    let e2 = 1_f64 - e1;
    let (s1, s2) = normalize_scores(player1_score, player2_score);
    println!(
        "Expected players to score {},{} but actually scored {}, {}",
        e1, e2, s1, s2
    );
    let K = get_k(player1_score, player2_score);
    println!("Using k={}", K);
    let r1p = r1 + (K * (s1 - e1));
    let r2p = r2 + (K * (s2 - e2));
    println!("Adjusting scores from {}, {} to {}, {}", r1, r2, r1p, r2p);
    (r1p, r2p)
}

fn get_k(score1: f64, score2: f64) -> f64 {
    if score1 + score2 == 1.0 {
        25.0
    } else {
        40.0
    }
}

fn normalize_scores(p1score: f64, p2score: f64) -> (f64, f64) {
    let sum = p1score + p2score;
    (p1score / sum, p2score / sum)
}
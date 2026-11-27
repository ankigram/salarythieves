export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json({
    updated_at: '2026-11-17',
    standings: [
      { rank: 1, team_name: '看我順風反盤 (Gao)', wins: 24, losses: 12, ties: 0, win_percentage: '.667' },
      { rank: 2, team_name: '放假中 (Jacky)', wins: 23, losses: 13, ties: 0, win_percentage: '.639' },
      { rank: 3, team_name: 'Pizza Pepperoni (Siu)', wins: 22, losses: 14, ties: 0, win_percentage: '.611' },
      { rank: 4, team_name: 'The King Hali is Back (Leo)', wins: 21, losses: 15, ties: 0, win_percentage: '.583' },
      { rank: 5, team_name: 'Chill G (Marx)', wins: 19, losses: 17, ties: 0, win_percentage: '.528' },
      { rank: 6, team_name: 'Love dlwlrma (Ching)', wins: 19, losses: 17, ties: 0, win_percentage: '.528' },
      { rank: 7, team_name: 'Miserable Medic (Marco)', wins: 18, losses: 18, ties: 0, win_percentage: '.500' },
      { rank: 8, team_name: 'Jeng2 (Kwing)', wins: 17, losses: 19, ties: 0, win_percentage: '.472' },
      { rank: 9, team_name: 'Crazy Big Four (Koby)', wins: 16, losses: 20, ties: 0, win_percentage: '.444' },
      { rank: 10, team_name: 'FirstTwoPicksDownAgain (Carlos)', wins: 14, losses: 22, ties: 0, win_percentage: '.389' },
      { rank: 11, team_name: 'DTD (Karson)', wins: 12, losses: 24, ties: 0, win_percentage: '.333' },
      { rank: 12, team_name: 'Loopy (Josh)', wins: 11, losses: 25, ties: 0, win_percentage: '.306' }
    ]
  });
}

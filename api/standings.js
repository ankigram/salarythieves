export default async function handler(req, res) {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const season = process.env.ESPN_SEASON || '2027';
  const espnS2 = process.env.ESPN_S2 || '';
  const swid = process.env.ESPN_SWID || '';

  if (!leagueId) {
    return res.status(500).json({ error: 'Missing ESPN_LEAGUE_ID environment variable' });
  }

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mStandings`;
  const headers = { Accept: 'application/json' };
  if (espnS2 && swid) {
    headers.Cookie = `espn_s2=${espnS2}; SWID=${swid}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return res.status(response.status).json({ error: `ESPN API returned ${response.status}` });
    }
    const data = await response.json();
    const teams = data.teams || [];

    const standings = [];
    for (const item of teams) {
      const { id, abbrev, playoffSeed, rankCalculatedFinal, record } = item;
      const teamName = item['name'] || `${item['location'] || ''} ${item['nickname'] || ''}`.trim() || abbrev || `Team ${id}`;
      const overall = (record && record.overall) || {};
      const wins = overall.wins ?? 0;
      const losses = overall.losses ?? 0;
      const ties = overall.ties ?? 0;
      const pct = typeof overall.percentage === 'number'
        ? overall.percentage.toFixed(3).replace(/^0/, '')
        : '.000';

      standings.push({
        rank: rankCalculatedFinal || playoffSeed || 99,
        team_name: teamName,
        wins,
        losses,
        ties,
        win_percentage: pct
      });
    }

    standings.sort((a, b) => a.rank - b.rank);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      updated_at: new Date().toISOString(),
      scoring_period: data.scoringPeriodId || null,
      standings
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch ESPN standings', detail: err.message });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const leagueId = process.env.ESPN_LEAGUE_ID;
  const season = process.env.ESPN_SEASON || '2027';
  const espnS2 = process.env.ESPN_S2 || '';
  const swid = process.env.ESPN_SWID || '';

  if (!leagueId) {
    return res.status(500).json({ error: 'Missing ESPN_LEAGUE_ID in Vercel Environment Variables' });
  }

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mStandings`;
  const headers = { Accept: 'application/json' };
  if (espnS2 && swid) {
    headers.Cookie = `espn_s2=${espnS2}; SWID=${swid}`;
  }

  try {
    const response = await fetch(url, { headers });
    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({
        error: `ESPN returned HTTP ${response.status}`,
        season,
        hasCookies: Boolean(espnS2 && swid),
        preview: text.slice(0, 200)
      });
    }

    const data = JSON.parse(text);
    const standings = [];
    for (const item of data.teams || []) {
      const overall = (item.record && item.record.overall) || {};
      const pct = typeof overall.percentage === 'number'
        ? overall.percentage.toFixed(3).replace(/^0/, '')
        : '.000';
      standings.push({
        rank: item.rankCalculatedFinal || item.playoffSeed || 99,
        team_name: item['name'] || item.abbrev || `Team ${item.id}`,
        wins: overall.wins ?? 0,
        losses: overall.losses ?? 0,
        ties: overall.ties ?? 0,
        win_percentage: pct
      });
    }

    standings.sort((a, b) => a.rank - b.rank);
    return res.status(200).json({
      source: 'espn-live',
      updated_at: new Date().toISOString(),
      standings
    });
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', detail: err.message });
  }
};

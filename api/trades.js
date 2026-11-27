export default async function handler(req, res) {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const season = process.env.ESPN_SEASON || '2027';
  const espnS2 = process.env.ESPN_S2 || '';
  const swid = process.env.ESPN_SWID || '';

  if (!leagueId) {
    return res.status(500).json({ error: 'Missing ESPN_LEAGUE_ID environment variable' });
  }

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mTransactions2`;
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

    const teamLookup = {};
    for (const item of data.teams || []) {
      teamLookup[item.id] = item['name'] || item.abbrev || `Team ${item.id}`;
    }

    const trades = [];
    for (const tx of data.transactions || []) {
      const isTrade = tx.type === 'TRADE_ACCEPTED' || tx.type === 'TRADE_PROCESSED';
      if (!isTrade || tx.status !== 'EXECUTED') continue;

      const involved = new Set();
      for (const move of tx.items || []) {
        if (move.fromTeamId && teamLookup[move.fromTeamId]) involved.add(teamLookup[move.fromTeamId]);
        if (move.toTeamId && teamLookup[move.toTeamId]) involved.add(teamLookup[move.toTeamId]);
      }

      const when = tx.processDate
        ? new Date(tx.processDate).toISOString().slice(0, 10)
        : '';

      trades.push({
        title: Array.from(involved).join(' ⇄ ') || '聯盟交易',
        summary: `涉及 ${(tx.items || []).length} 名球員異動`,
        completed_at: when
      });
    }

    trades.reverse();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ trades });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch ESPN trades', detail: err.message });
  }
}

select
  songs.id,
  songs.name,
  charts.play_style,
  charts.difficulty,
  charts.bpm,
  charts.level,
  charts.notes,
  charts.freezes,
  charts.shocks
from songs
  inner join charts on songs.id = charts.id
where
  charts.notes is null
  or charts.freezes is null
  or charts.shocks is null
  or (
    charts.radar is null
    and songs.bpm is not null
  )
order by songs.name_index,
songs.name_kana

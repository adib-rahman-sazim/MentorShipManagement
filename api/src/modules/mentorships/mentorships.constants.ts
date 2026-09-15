export const MENTORSHIP_SUBTREE_MAX_DEPTH = 10;

export const MENTORSHIP_DESCENDANTS_SQL = `
  with recursive subtree (user_id, depth, path) as (
    select m.subordinate_id, 1, array[m.supervisor_id, m.subordinate_id]
    from mentorships m
    where m.supervisor_id = ?
      and m.status = 'ACTIVE'
      and m.deleted_at is null
    union all
    select m.subordinate_id, s.depth + 1, s.path || m.subordinate_id
    from mentorships m
    join subtree s on m.supervisor_id = s.user_id
    where m.status = 'ACTIVE'
      and m.deleted_at is null
      and s.depth < ?
      and not m.subordinate_id = any(s.path)
  )
  select distinct user_id from subtree;
`;

export const MENTORSHIP_ANCESTORS_SQL = `
  with recursive chain (user_id, depth, path) as (
    select m.supervisor_id, 1, array[m.subordinate_id, m.supervisor_id]
    from mentorships m
    where m.subordinate_id = ?
      and m.status = 'ACTIVE'
      and m.deleted_at is null
    union all
    select m.supervisor_id, c.depth + 1, c.path || m.supervisor_id
    from mentorships m
    join chain c on m.subordinate_id = c.user_id
    where m.status = 'ACTIVE'
      and m.deleted_at is null
      and c.depth < ?
      and not m.supervisor_id = any(c.path)
  )
  select distinct user_id from chain;
`;

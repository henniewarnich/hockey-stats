import { teamDerivedName } from '../utils/teams.js';

const GENDERS = ['Girls', 'Boys'];
const AGES = ['1st', 'U16', 'U14'];

const ALL_LABEL = { gender: 'All', age: 'All ages' };

function cycle(current, options) {
  if (!current) return options[0];
  const idx = options.indexOf(current);
  if (idx === -1 || idx === options.length - 1) return null;
  return options[idx + 1];
}

const pillStyle = (active, color, clickable = true) => ({
  flex: 1, padding: '6px 4px', borderRadius: 6, fontSize: 11, fontWeight: 700,
  textAlign: 'center', cursor: clickable ? 'pointer' : 'default', transition: 'all 0.15s',
  border: active ? `1px solid ${color}44` : '1px solid #33415544',
  background: active ? `${color}22` : '#1E293B',
  color: active ? color : '#64748B',
});

export default function FilterBar({ sport, gender, age, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <div style={pillStyle(true, '#10B981', false)}>
        🏑 Hockey
      </div>
      <div style={pillStyle(gender, '#3B82F6')}
        onClick={() => onChange({ sport, gender: cycle(gender, GENDERS), age })}>
        {gender || ALL_LABEL.gender}
      </div>
      <div style={pillStyle(age, '#F59E0B')}
        onClick={() => onChange({ sport, gender, age: cycle(age, AGES) })}>
        {age || ALL_LABEL.age}
      </div>
    </div>
  );
}

/**
 * Filter a match by sport/gender/age. Checks home_team fields.
 * null filter value = show all.
 */
export function matchPassesFilter(m, { sport, gender, age }) {
  const t = m.home_team;
  if (!t) return true;
  if (sport && t.sport !== sport) return false;
  if (gender && t.gender !== gender) return false;
  if (age && t.age_group !== age) return false;
  return true;
}

/**
 * Filter a team by sport/gender/age.
 */
export function teamPassesFilter(t, { sport, gender, age }) {
  if (!t) return true;
  if (sport && t.sport !== sport) return false;
  if (gender && t.gender !== gender) return false;
  if (age && t.age_group !== age) return false;
  return true;
}

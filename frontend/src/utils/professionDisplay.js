/**
 * Turn API profession value into a label: supports numeric id, id string, or stored name.
 */
export function resolveProfessionLabel(raw, professionsList) {
  const prof =
    raw != null && raw !== "" ? String(raw).trim() : "";
  if (!prof) return "—";

  const list = Array.isArray(professionsList) ? professionsList : [];

  if (/^\d+$/.test(prof)) {
    const idNum = Number.parseInt(prof, 10);
    const byId = list.find((p) => Number(p.id) === idNum);
    if (byId?.name) return byId.name;
    return prof;
  }

  const lower = prof.toLowerCase();
  const byName = list.find(
    (p) =>
      p?.name && String(p.name).trim().toLowerCase() === lower
  );
  if (byName?.name) return byName.name;

  return prof;
}

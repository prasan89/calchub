export default function AdSidebar() {
  return (
    <aside
      style={{
        width: 300,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Top ad slot — 300×250 */}
      <div
        style={{
          width: 300,
          height: 250,
          background: "var(--wash)",
          border: "1px dashed var(--line)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: ".04em",
        }}
      >
        AD 300×250
      </div>

      {/* Sticky tall ad slot — 300×600 */}
      <div
        style={{
          position: "sticky",
          top: 20,
          width: 300,
          height: 600,
          background: "var(--wash)",
          border: "1px dashed var(--line)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: ".04em",
        }}
      >
        AD 300×600
      </div>
    </aside>
  );
}

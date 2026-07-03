// FilterBar chỉ làm 1 việc: hiển thị thanh lọc và báo lựa chọn ra ngoài qua onChange
const FILTERS = [
  { key: "all",      label: "Tất cả" },
  { key: "active",   label: "Đang làm" },
  { key: "done",     label: "Đã xong" },
  { key: "deadline", label: "Theo deadline" },
];

export default function FilterBar({ current, onChange }) {
  return (
    <div style={styles.bar}>
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          style={{
            ...styles.btn,
            ...(current === f.key ? styles.btnActive : {}),
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  bar: {
    display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap",
  },
  btn: {
    padding: "6px 14px", fontSize: "13px", border: "1px solid #eee",
    borderRadius: "20px", backgroundColor: "#fff", color: "#666", cursor: "pointer",
  },
  btnActive: {
    backgroundColor: "#111", borderColor: "#111", color: "#fff",
  },
};
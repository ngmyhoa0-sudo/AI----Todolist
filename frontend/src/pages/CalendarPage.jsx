export default function CalendarPage() {
    return (
        <div>
            <h1 style={styles.title}>Lịch</h1>
            <p style={styles.placeholder}>Tính năng xem theo lịch đang được phát triển...</p>
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#111",
        margin: "0 0 20px 0",
        letterSpacing: "-0.3px",
    },
    placeholder: {
        textAlign: "center",
        color: "#999",
        fontSize: "14px",
        padding: "40px 0",
    },
};
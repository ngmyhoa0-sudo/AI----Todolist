import StatsCard from "../components/StatsCard";
import StatsChart from "../components/StatsChart";
import StatsDonut from "../components/StatsDonut";
import { useTaskRefresh } from "../context/TaskRefreshContext";
import { useLanguage } from "../context/LanguageContext";

export default function StatsPage() {
    const { version } = useTaskRefresh();
    const { t } = useLanguage();
    return (
        <div>
            <h1 style={styles.title}>{t("statsPageTitle")}</h1>
            <StatsCard refreshTrigger={version} />
            <div style={styles.chartsRow}>
                <div style={styles.chartCol}>
                    <StatsChart refreshTrigger={version} />
                </div>
                <div style={styles.chartCol}>
                    <StatsDonut refreshTrigger={version} />
                </div>
            </div>
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px",
        fontWeight: "800",
        color: "#1a2b4c",
        margin: "0 0 20px 0",
        letterSpacing: "-0.3px",
    },
    chartsRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
    },
    chartCol: {
        flex: "1 1 320px",
        minWidth: 0,
    },
};
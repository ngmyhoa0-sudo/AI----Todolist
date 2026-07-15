import StatsCard from "../components/StatsCard";
import StatsChart from "../components/StatsChart";
import { useTaskRefresh } from "../context/TaskRefreshContext";
import { useLanguage } from "../context/LanguageContext";

export default function StatsPage() {
    const { version } = useTaskRefresh();
    const { t } = useLanguage();
    return (
        <div>
            <h1 style={styles.title}>{t("statsPageTitle")}</h1>
            <StatsCard refreshTrigger={version} />
            <StatsChart refreshTrigger={version} />
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
};
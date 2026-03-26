import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import MonthYearPicker from "./MonthYearPicker";
import DetailModal from "./DetailModal";

function getHostPort() {
    const os = Platform.OS;
    console.log(os);
    if (os === "android")
    {
        return "10.0.2.2:3000";
    }

    return "localhost:3000";
}

const HOSTPORT = getHostPort();

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const TODAY = new Date();

export default function CalendarView() {
    // date state
    const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth());
    const [currentYear, setCurrentYear] = useState(TODAY.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);

    // events state
    const [events, setEvents] = useState([]);

    // event details
    const [detailsTitle, setDetailsTitle] = useState("title");
    const [detailsTime, setDetailsTime] = useState("time");
    const [detailsLocation, setDetailsLocation] = useState("location");
    const [detailsOpenSlots, setDetailsOpenSlots] = useState("open slots");
    const [detailsDescription, setDetailsDescription] = useState("description");
    const [detailsID, setDetailsID] = useState("");

    // conditional rendering
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(
                `http://${HOSTPORT}/volunteerShiftEvent`
            );
            const data = response.data;
            setEvents(Array.isArray(data) ? data : data?.events ?? []);
        } catch (err) {
            console.log("Failed to fetch events:", err.message);
        }
    };

    const updateCurrentMonth = (month, year) => {
        setCurrentMonth(month);
        setCurrentYear(year);
        fetchEventsForMonth(month, year);
    };

    const fetchEventsForMonth = async (month, year) => {
        const lastDay = new Date(year, month + 1, 0).getDate();
        const earliestTime = new Date(year, month, 1, 0, 0).toISOString();
        const latestTime = new Date(year, month, lastDay, 23, 59).toISOString();

        const MAX_PAGES = 10;
        const requests = Array.from({ length: MAX_PAGES }, (_, page) =>
            axios
                .get(`http://${HOSTPORT}/volunteerShiftEvent/${page}/${earliestTime}/${latestTime}`)
                .then(({ data }) => (Array.isArray(data) ? data : []))
                .catch(() => [])
        );

        const results = await Promise.all(requests);
        setEvents(results.flat());
    }

    const getEventsForDay = (day) => {
        if (!day)
        {
            return [];
        }

        const target = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);

        return events.filter((event) => {
            if (!event.StartTime) 
            {
                return false;
            }

            const eventDate = new Date(event.StartTime).toISOString().slice(0, 10);
            return eventDate === target;
        });
    };

    useEffect(() => {
        fetchEventsForMonth(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    const openPicker = () => {
        setPickerVisible(true);
    };

    const confirmPicker = (month, year) => {
        updateCurrentMonth(month, year);
        setSelectedDate(null);
        setPickerVisible(false);
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            updateCurrentMonth(11, currentYear - 1);
        } else {
            updateCurrentMonth(currentMonth - 1, currentYear);
        }
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            updateCurrentMonth(0, currentYear + 1);
        } else {
            updateCurrentMonth(currentMonth + 1, currentYear);
        }
        setSelectedDate(null);
    };

    const countRegistrations = (event) => {
        let count = 0;

        for (const group of event.UserGroupRegistrations || []) 
        {
            for (const user of group.UserRegistrations || [])
            {
                if (!user.Deleted) 
                {
                    count++;
                }
            }
        }

        return count;
    };

    const onEventSelected = (event, time) => {
        setDetailsVisible(true);
        setDetailsTitle(event.Name);
        setDetailsTime(time);
        setDetailsLocation(event.Location);

        const registrations = countRegistrations(event);
        let openSlots = event.SlotLimit - registrations;
        if (openSlots < 0)
        {
            openSlots = 0;
        }

        setDetailsOpenSlots(openSlots);
        setDetailsDescription(event.ShortDescription);
        setDetailsID(event.EventUid);
    }

    // Build flat array of day cells (null = padding, number = day of month)
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarDays = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

    const isToday = (day) =>
        day === TODAY.getDate() &&
        currentMonth === TODAY.getMonth() &&
        currentYear === TODAY.getFullYear();

    const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];
    const weeks = Array.from(
        { length: calendarDays.length / 7 },
        (_, i) => calendarDays.slice(i * 7, i * 7 + 7)
    );

    return (
        <View style={styles.container}>
            <MonthYearPicker
                visible={pickerVisible}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onConfirm={confirmPicker}
                onCancel={() => setPickerVisible(false)}
            />

            <DetailModal
                visible={detailsVisible}
                title={detailsTitle}
                time={detailsTime}
                location={detailsLocation}
                openSlots={detailsOpenSlots}
                description={detailsDescription}
                id={detailsID}
                onClose={() => setDetailsVisible(false)}
            />

            {/* ── Month navigation header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                    <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openPicker} style={styles.monthYearBtn}>
                    <Text style={styles.monthYear}>
                        {MONTHS[currentMonth]} {currentYear}
                    </Text>
                    <Text style={styles.monthYearCaret}>▾</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                    <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* ── Day-of-week labels ── */}
            <View style={styles.row}>
                {DAYS_OF_WEEK.map((d) => (
                    <Text key={d} style={styles.dayLabel}>
                        {d}
                    </Text>
                ))}
            </View>

            {/* ── Calendar grid ── */}
            {weeks.map((week, wi) => (
                <View key={wi} style={styles.row}>
                    {week.map((day, di) => {
                        const hasEvents = getEventsForDay(day).length > 0;
                        const selected = selectedDate === day && day !== null;
                        const todayCell = isToday(day);
                        return (
                            <TouchableOpacity
                                key={di}
                                disabled={!day}
                                onPress={() =>
                                    setSelectedDate(selected ? null : day)
                                }
                                style={[
                                    styles.dayCell,
                                    todayCell && !selected && styles.todayCell,
                                    selected && styles.selectedCell,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        todayCell && !selected && styles.todayText,
                                        selected && styles.selectedText,
                                    ]}
                                >
                                    {day ?? ""}
                                </Text>
                                {hasEvents && (
                                    <View
                                        style={[
                                            styles.dot,
                                            selected && styles.dotSelected,
                                        ]}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            {/* ── Event list for selected day ── */}
            {selectedDate !== null && (
                <View style={styles.eventSection}>
                    <Text style={styles.eventHeader}>
                        {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                    </Text>
                    {selectedEvents.length === 0 ? (
                        <Text style={styles.noEvents}>No events scheduled</Text>
                    ) : (
                        <ScrollView style={styles.eventScroll}>
                            {selectedEvents.map((event, idx) => {
                                const start = new Date(event.StartTime);
                                const end = new Date(event.EndTime);
                                const duration = `${start.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} - ${end.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`
                            
                                // this is the event component 
                                return (
                                    <View key={idx} style={styles.eventCard} >
                                        <TouchableOpacity onPress={() => onEventSelected(event, duration)}>
                                            <Text style={styles.eventTitle}>
                                                {event.Name ?? "Untitled Event"}
                                            </Text>
                                            {duration && (
                                                <Text style={styles.eventTime}>
                                                    {duration}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    monthYearBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    monthYear: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    monthYearCaret: {
        fontSize: 12,
        color: "#004953",
        marginTop: 2,
    },
    navBtn: {
        padding: 8,
    },
    navArrow: {
        fontSize: 26,
        color: "#004953",
        lineHeight: 28,
    },

    // ── Grid ──
    row: {
        flexDirection: "row",
    },
    dayLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#9e9e9e",
        paddingVertical: 4,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        margin: 2,
    },
    todayCell: {
        backgroundColor: "#e6eff1",
    },
    selectedCell: {
        backgroundColor: "#004953",
    },
    dayText: {
        fontSize: 14,
        color: "#333333",
    },
    todayText: {
        color: "#004953",
        fontWeight: "700",
    },
    selectedText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#8E9300",
        marginTop: 2,
    },
    dotSelected: {
        backgroundColor: "#ffffff",
    },

    // ── Event list ──
    eventSection: {
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 12,
    },
    eventHeader: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    noEvents: {
        fontSize: 14,
        color: "#aaaaaa",
        fontStyle: "italic",
    },
    eventScroll: {
        maxHeight: 200,
    },
    eventCard: {
        backgroundColor: "#f3f4e8",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#8E9300",
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333333",
    },
    eventTime: {
        fontSize: 12,
        color: "#666666",
        marginTop: 3,
    },
});

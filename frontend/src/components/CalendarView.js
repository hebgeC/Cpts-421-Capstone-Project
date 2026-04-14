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
    const [selectedDate, setSelectedDate] = useState(TODAY.getDate());

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
    };

    const fetchEventsForMonth = async (month, year) => {
        console.log(`fetching events for ${MONTHS[month]} ${year}`);
        const lastDay = new Date(year, month + 1, 0).getDate();
        const earliestTime = new Date(year, month, 1, 0, 0).toISOString();
        const latestTime = new Date(year, month, lastDay, 23, 59).toISOString();

        const MAX_PAGES = 10;
        const HARD_PAGES_CAP = 20;
        const requests = Array.from({ length: MAX_PAGES }, (_, page) =>
            axios
                .get(`http://${HOSTPORT}/volunteerShiftEvent/${page}/${earliestTime}/${latestTime}`)
                .then(({ data }) => (Array.isArray(data) ? data : []))
                .catch(() => [])
        );

        const results = await Promise.all(requests);
        
        setEvents(results.flat());

        // check if there are more than 10 pages worht of events (50 events per page)
        if (results[MAX_PAGES - 1].length === 50)
        {
            let page = MAX_PAGES + 1;
            // need to keep fetching events
            while (page < HARD_PAGES_CAP)
            {
                let data = (await axios.get(`http://${HOSTPORT}/volunteerShiftEvent/${page}/${earliestTime}/${latestTime}`)).data;
                results.push(data);

                if (data.length < 50)
                {
                    break;
                }

                ++page;
            }

            setEvents(results.flat());
        }
    }

    const getEventsForDay = (day) => {
        if (!day) {
            return [];
        }

        const target = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);

        return events.filter((event) => {
            if (!event.StartTime) {
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
            {/* ── Modals ── */}
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

            {/* ── Sticky top: navigation + grid ── */}
            <View style={styles.gridSection}>
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

            </View>{/* end gridSection */}

            {/* ── Scrollable event list for selected day ── */}
            <ScrollView
                style={styles.eventScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                stickyHeaderIndices={selectedDate !== null ? [0] : []}
            >
                {selectedDate !== null && (
                    <View style={styles.eventHeaderContainer}>
                        <Text style={styles.eventHeader}>
                            {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                        </Text>
                    </View>
                )}
                {selectedDate !== null && (
                    <View style={styles.eventSection}>
                        {selectedEvents.length === 0 ? (
                            <Text style={styles.noEvents}>No events scheduled</Text>
                        ) : (
                            selectedEvents.map((event, idx) => {
                                const start = new Date(event.StartTime);
                                const end = new Date(event.EndTime);
                                const duration = `${start.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} - ${end.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`;

                                return (
                                    <View key={idx} style={styles.eventCard}>
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
                            })
                        )}
                    </View>
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    gridSection: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EBEBEB",
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
        color: "#2C1810",
    },
    monthYearCaret: {
        fontSize: 12,
        color: "#C0392B",
        marginTop: 2,
    },
    navBtn: {
        padding: 8,
    },
    navArrow: {
        fontSize: 26,
        color: "#C0392B",
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
        color: "#AAAAAA",
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
        backgroundColor: "#FDECEA",
    },
    selectedCell: {
        backgroundColor: "#C0392B",
    },
    dayText: {
        fontSize: 14,
        color: "#2C1810",
    },
    todayText: {
        color: "#C0392B",
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
        backgroundColor: "#C0392B",
        marginTop: 2,
    },
    dotSelected: {
        backgroundColor: "#ffffff",
    },

    // ── Event list ──
    eventHeaderContainer: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EBEBEB",
    },
    eventHeader: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2C1810",
    },
    eventSection: {
        paddingTop: 10,
    },
    noEvents: {
        fontSize: 14,
        color: "#aaaaaa",
        fontStyle: "italic",
    },
    eventScroll: {
        flex: 1,
        paddingHorizontal: 14,
    },
    eventCard: {
        backgroundColor: "#FDECEA",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#C0392B",
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2C1810",
    },
    eventTime: {
        fontSize: 12,
        color: "#8B6B5A",
        marginTop: 3,
    },
});
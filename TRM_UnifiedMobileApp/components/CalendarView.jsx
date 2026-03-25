import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    FlatList,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function getHostPort() {
    const os = Platform.OS;
    if (os === "android") return "10.0.2.2:3000";
    return "localhost:3000";
}

const HOSTPORT = getHostPort();

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const TODAY = new Date();
const YEAR_RANGE = Array.from({ length: 21 }, (_, i) => TODAY.getFullYear() - 7 + i);

export default function CalendarView() {
    // date state
    const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth());
    const [currentYear, setCurrentYear] = useState(TODAY.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);

    // events state
    const [events, setEvents] = useState([]);

    // Picker state
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(TODAY.getMonth());
    const [pickerYear, setPickerYear] = useState(TODAY.getFullYear());

    const monthListRef = useRef(null);
    const yearListRef = useRef(null);

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
        const numDays = new Date(year, month + 1, 0).getDate();

        const requests = Array.from({ length: numDays }, (_, i) => {
            const day = i + 1;
            const earliestTime = new Date(year, month, day, 0, 0).toISOString();
            const latestTime = new Date(year, month, day, 23, 59).toISOString();

            return axios
                .get(`http://${HOSTPORT}/volunteerShiftEvent/${earliestTime}/${latestTime}`)
                .then((response) => response.data)
                .catch((err) => {
                    console.log("Failed to fetch events:", err.message);
                    return [];
                });
        });

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

    // Scroll picker lists to the selected item when the modal opens
    useEffect(() => {
        if (pickerVisible) {
            setTimeout(() => {
                monthListRef.current?.scrollToIndex({
                    index: pickerMonth,
                    animated: false,
                    viewPosition: 0.5,
                });
                const yearIdx = YEAR_RANGE.indexOf(pickerYear);
                if (yearIdx >= 0) {
                    yearListRef.current?.scrollToIndex({
                        index: yearIdx,
                        animated: false,
                        viewPosition: 0.5,
                    });
                }
            }, 50);
        }
    }, [pickerVisible]);

    const openPicker = () => {
        setPickerMonth(currentMonth);
        setPickerYear(currentYear);
        setPickerVisible(true);
    };

    const confirmPicker = () => {
        updateCurrentMonth(pickerMonth, pickerYear);
        setCurrentYear(pickerYear);
        setSelectedDate(null);
        setPickerVisible(false);
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            updateCurrentMonth(11, pickerYear);
            setCurrentYear(currentYear - 1);
        } else {
            updateCurrentMonth(currentMonth - 1, pickerYear);
        }
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            updateCurrentMonth(0, pickerYear);
            setCurrentYear(currentYear + 1);
        } else {
            updateCurrentMonth(currentMonth + 1, pickerYear);
        }
        setSelectedDate(null);
    };

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
            {/* ── Month/Year Picker Modal ── */}
            <Modal
                visible={pickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerVisible(false)}

            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setPickerVisible(false)}
                >
                    <View
                        style={styles.pickerCard}
                        // Prevent backdrop tap from closing when pressing the card
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={styles.pickerTitle}>Select Month & Year</Text>

                        <View style={styles.pickerColumns}>
                            {/* Month column */}
                            <FlatList
                                ref={monthListRef}
                                data={MONTHS}
                                keyExtractor={(_, i) => String(i)}
                                style={styles.pickerList}
                                showsVerticalScrollIndicator={false}
                                getItemLayout={(_, index) => ({
                                    length: PICKER_ITEM_H,
                                    offset: PICKER_ITEM_H * index,
                                    index,
                                })}
                                renderItem={({ item, index }) => {
                                    const active = index === pickerMonth;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setPickerMonth(index)}
                                            style={[
                                                styles.pickerItem,
                                                active && styles.pickerItemActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.pickerItemText,
                                                    active && styles.pickerItemTextActive,
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />

                            {/* Year column */}
                            <FlatList
                                ref={yearListRef}
                                data={YEAR_RANGE}
                                keyExtractor={(y) => String(y)}
                                style={styles.pickerList}
                                showsVerticalScrollIndicator={false}
                                getItemLayout={(_, index) => ({
                                    length: PICKER_ITEM_H,
                                    offset: PICKER_ITEM_H * index,
                                    index,
                                })}
                                renderItem={({ item }) => {
                                    const active = item === pickerYear;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setPickerYear(item)}
                                            style={[
                                                styles.pickerItem,
                                                active && styles.pickerItemActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.pickerItemText,
                                                    active && styles.pickerItemTextActive,
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Actions */}
                        <View style={styles.pickerActions}>
                            <TouchableOpacity
                                onPress={() => setPickerVisible(false)}
                                style={[styles.pickerBtn, styles.pickerBtnCancel]}
                            >
                                <Text style={styles.pickerBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmPicker}
                                style={[styles.pickerBtn, styles.pickerBtnConfirm]}
                            >
                                <Text style={styles.pickerBtnConfirmText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

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
                            
                                return (
                                    <View key={idx} style={styles.eventCard}>
                                        <Text style={styles.eventTitle}>
                                            {event.Name ?? "Untitled Event"}
                                        </Text>
                                        {duration && (
                                            <Text style={styles.eventTime}>
                                                {duration}
                                            </Text>
                                        )}
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

const PICKER_ITEM_H = 44;

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

    // ── Picker modal ──
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    pickerCard: {
        width: 320,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        textAlign: "center",
        marginBottom: 14,
    },
    pickerColumns: {
        flexDirection: "row",
        height: PICKER_ITEM_H * 5,
    },
    pickerList: {
        flex: 1,
    },
    pickerItem: {
        height: PICKER_ITEM_H,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginHorizontal: 4,
    },
    pickerItemActive: {
        backgroundColor: "#4a90e2",
    },
    pickerItemText: {
        fontSize: 15,
        color: "#444",
    },
    pickerItemTextActive: {
        color: "#fff",
        fontWeight: "700",
    },
    pickerActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
        gap: 10,
    },
    pickerBtn: {
        paddingVertical: 9,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    pickerBtnCancel: {
        backgroundColor: "#f0f0f0",
    },
    pickerBtnCancelText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "600",
    },
    pickerBtnConfirm: {
        backgroundColor: "#4a90e2",
    },
    pickerBtnConfirmText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "700",
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
        color: "#4a90e2",
        marginTop: 2,
    },
    navBtn: {
        padding: 8,
    },
    navArrow: {
        fontSize: 26,
        color: "#4a90e2",
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
        backgroundColor: "#e8f0fe",
    },
    selectedCell: {
        backgroundColor: "#4a90e2",
    },
    dayText: {
        fontSize: 14,
        color: "#333333",
    },
    todayText: {
        color: "#4a90e2",
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
        backgroundColor: "#4a90e2",
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
        backgroundColor: "#f0f6ff",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#4a90e2",
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

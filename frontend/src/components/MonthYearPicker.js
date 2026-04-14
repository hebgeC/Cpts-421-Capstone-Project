import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
} from "react-native";
import { useState, useEffect, useRef } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const TODAY = new Date();
const YEAR_RANGE = Array.from({ length: 21 }, (_, i) => TODAY.getFullYear() - 16 + i);
const PICKER_ITEM_H = 44;

export default function MonthYearPicker({ visible, currentMonth, currentYear, onConfirm, onCancel }) {
    const [pickerMonth, setPickerMonth] = useState(currentMonth);
    const [pickerYear, setPickerYear] = useState(currentYear);

    const monthListRef = useRef(null);
    const yearListRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setPickerMonth(currentMonth);
            setPickerYear(currentYear);
            setTimeout(() => {
                monthListRef.current?.scrollToIndex({
                    index: currentMonth,
                    animated: false,
                    viewPosition: 0.5,
                });
                const yearIdx = YEAR_RANGE.indexOf(currentYear);
                if (yearIdx >= 0) {
                    yearListRef.current?.scrollToIndex({
                        index: yearIdx,
                        animated: false,
                        viewPosition: 0.5,
                    });
                }
            }, 50);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={onCancel}
            >
                <View
                    style={styles.pickerCard}
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
                            onPress={onCancel}
                            style={[styles.pickerBtn, styles.pickerBtnCancel]}
                        >
                            <Text style={styles.pickerBtnCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onConfirm(pickerMonth, pickerYear)}
                            style={[styles.pickerBtn, styles.pickerBtnConfirm]}
                        >
                            <Text style={styles.pickerBtnConfirmText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
        color: "#2C1810",
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
        backgroundColor: "#C0392B",
    },
    pickerItemText: {
        fontSize: 15,
        color: "#2C1810",
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
        backgroundColor: "#EBEBEB",
    },
    pickerBtnCancelText: {
        fontSize: 14,
        color: "#8B6B5A",
        fontWeight: "600",
    },
    pickerBtnConfirm: {
        backgroundColor: "#C0392B",
    },
    pickerBtnConfirmText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "700",
    },
});
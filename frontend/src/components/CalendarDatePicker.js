import React, { useEffect, useState } from 'react';
import {
  Modal, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseISODate(value) {
  const [year, month, day] = (value || '').split('-').map(Number);
  if (year && month && day) return { year, month: month - 1, day };
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
}

export default function CalendarDatePicker({ visible, value, onConfirm, onCancel }) {
  const initialDate = parseISODate(value);
  const [displayYear, setDisplayYear] = useState(initialDate.year);
  const [displayMonth, setDisplayMonth] = useState(initialDate.month);
  const [selectedDate, setSelectedDate] = useState(value);

  useEffect(() => {
    if (!visible) return;
    const date = parseISODate(value);
    setDisplayYear(date.year);
    setDisplayMonth(date.month);
    setSelectedDate(toISODate(date.year, date.month, date.day));
  }, [value, visible]);

  const moveMonth = (amount) => {
    const next = new Date(displayYear, displayMonth + amount, 1);
    setDisplayYear(next.getFullYear());
    setDisplayMonth(next.getMonth());
  };

  const selectToday = () => {
    const today = new Date();
    setDisplayYear(today.getFullYear());
    setDisplayMonth(today.getMonth());
    setSelectedDate(toISODate(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const firstWeekday = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Select a day</Text>

          <View style={styles.monthNavigation}>
            <TouchableOpacity style={styles.yearButton} onPress={() => moveMonth(-12)}>
              <Icon name="play-back" size={17} color="#8B6B5A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navigationButton} onPress={() => moveMonth(-1)}>
              <Icon name="chevron-back" size={20} color="#2C1810" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[displayMonth]} {displayYear}</Text>
            <TouchableOpacity style={styles.navigationButton} onPress={() => moveMonth(1)}>
              <Icon name="chevron-forward" size={20} color="#2C1810" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.yearButton} onPress={() => moveMonth(12)}>
              <Icon name="play-forward" size={17} color="#8B6B5A" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday, index) => (
              <Text key={`${weekday}-${index}`} style={styles.weekday}>{weekday}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {cells.map((day, index) => {
              const dateKey = day ? toISODate(displayYear, displayMonth, day) : null;
              const selected = dateKey === selectedDate;
              return (
                <View key={`${index}-${day || 'empty'}`} style={styles.dayCell}>
                  {day ? (
                    <TouchableOpacity
                      style={[styles.dayButton, selected && styles.dayButtonSelected]}
                      onPress={() => setSelectedDate(dateKey)}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.todayButton} onPress={selectToday}>
              <Text style={styles.todayText}>Today</Text>
            </TouchableOpacity>
            <View style={styles.actionSpacer} />
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => onConfirm(selectedDate)}
            >
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  title: { fontSize: 17, fontWeight: '800', color: '#2C1810', textAlign: 'center', marginBottom: 16 },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#2C1810' },
  navigationButton: { padding: 6 },
  yearButton: { padding: 6 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { width: '14.2857%', textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#8B6B5A' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayButtonSelected: { backgroundColor: '#C0392B' },
  dayText: { fontSize: 14, color: '#2C1810' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  actionSpacer: { flex: 1 },
  todayButton: { paddingVertical: 9, paddingHorizontal: 4 },
  todayText: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
  actionButton: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 8 },
  cancelButton: { backgroundColor: '#EBEBEB' },
  confirmButton: { backgroundColor: '#C0392B' },
  cancelText: { fontSize: 14, color: '#8B6B5A', fontWeight: '600' },
  confirmText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
});

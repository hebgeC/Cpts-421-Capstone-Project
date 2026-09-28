import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, TextInput, Image, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/api';

const MONTH_MAP = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// "2026-11-27 15:00:00" -> "3:00 PM"
function formatTime(datetime) {
  const timePart = (datetime || '').split(' ')[1];
  if (!timePart) return '';
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

// e.g. "November 27, 2026 @ 3:00 PM - 6:00 PM"
function formatDatetimeRange(startDate, endDate) {
  const [datePart] = (startDate || '').split(' ');
  const [year, mm, dd] = (datePart || '').split('-');
  if (!mm) return '';
  const monthName = MONTH_NAMES[parseInt(mm, 10) - 1] || '';
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);
  const dayLabel = `${monthName} ${parseInt(dd, 10)}, ${year}`;
  if (startTime && endTime) return `${dayLabel} @ ${startTime} - ${endTime}`;
  if (startTime) return `${dayLabel} @ ${startTime}`;
  return dayLabel;
}

function mapEvent(e) {
  const [datePart] = (e.startDate || '').split(' ');
  const [, mm, dd] = (datePart || '').split('-');
  const month = MONTH_MAP[mm] || '';
  const day = dd ? String(parseInt(dd, 10)) : '';

  return {
    id: e.id,
    month,
    day,
    datetime: formatDatetimeRange(e.startDate, e.endDate),
    title: e.title,
    url: e.url,
    image: e.image,
    venue: e.venue,
    address: e.address,
    description: e.description,
    price: e.cost && e.cost !== 'Free' ? e.cost : null,
  };
}

export default function EventsScreen() {
  const [searchText, setSearchText] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [noUpcoming, setNoUpcoming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);

      const [upcomingRes, pastRes] = await Promise.all([
        fetch(`${API_BASE_URL}/events?per_page=50`),
        fetch(`${API_BASE_URL}/events?per_page=50&start_date=2000-01-01&end_date=${todayISO()}`),
      ]);
      const upcomingJson = await upcomingRes.json();
      const pastJson = await pastRes.json();

      const upcoming = (upcomingJson.events || []).map(mapEvent);
      const past = (pastJson.events || []).map(mapEvent).reverse();

      setNoUpcoming(upcoming.length === 0);
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (e) {
      setError('Could not load events. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const onRefresh = () => { setRefreshing(true); fetchEvents(); };

  const filter = list =>
    list.filter(e =>
      e.title.toLowerCase().includes(searchText.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchText.toLowerCase())
    );

  const renderEvent = (event, index, arr) => (
    <View key={event.id}>
      <TouchableOpacity
        style={styles.eventRow}
        activeOpacity={0.88}
        onPress={() => Linking.openURL(event.url)}
      >
        {/* Date block */}
        <View style={styles.dateBlock}>
          <Text style={styles.dateMonth}>
            {event.month ? event.month.toUpperCase() : '---'}
          </Text>
          <Text style={styles.dateDay}>
            {event.day || '--'}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.eventBody}>
          {event.image && (
            <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
          )}
          {event.datetime ? (
            <Text style={styles.eventDatetime}>{event.datetime}</Text>
          ) : null}
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.venue ? <Text style={styles.eventVenue}>{event.venue}</Text> : null}
          {event.address ? <Text style={styles.eventAddress}>{event.address}</Text> : null}
          {event.description ? (
            <Text style={styles.eventDescription} numberOfLines={4}>{event.description}</Text>
          ) : null}
          {event.price ? <Text style={styles.priceText}>{event.price}</Text> : null}
        </View>
      </TouchableOpacity>
      {index < arr.length - 1 && <View style={styles.eventDivider} />}
    </View>
  );

  const filteredUpcoming = filter(upcomingEvents);
  const filteredPast = filter(pastEvents);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C0392B" />
        }
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Events</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Icon name="search-outline" size={16} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter Keyword. Search for Events by Keyword."
              placeholderTextColor="#AAAAAA"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.findBtn}>
            <Text style={styles.findBtnText}>Find Events</Text>
          </TouchableOpacity>
        </View>

        {/* View toggle */}
        <View style={styles.viewToggleRow}>
          <TouchableOpacity style={[styles.viewToggleBtn, styles.viewToggleBtnActive]}>
            <Icon name="list" size={14} color="#FFFFFF" />
            <Text style={styles.viewToggleLabelActive}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewToggleBtn}>
            <Icon name="calendar-outline" size={14} color="#555" />
            <Text style={styles.viewToggleLabel}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewToggleBtn}>
            <Icon name="today-outline" size={14} color="#555" />
            <Text style={styles.viewToggleLabel}>Day</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#C0392B" />
            <Text style={styles.loadingText}>Loading events from TRM...</Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Icon name="wifi-outline" size={24} color="#C0392B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchEvents}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {noUpcoming && filteredUpcoming.length === 0 && (
              <View style={styles.noUpcomingBox}>
                <Text style={styles.noUpcomingText}>There are no upcoming events.</Text>
              </View>
            )}

            {filteredUpcoming.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Upcoming Events</Text>
                {filteredUpcoming.map((e, i, arr) => renderEvent(e, i, arr))}
              </>
            )}

            <View style={styles.divider} />

            {filteredPast.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Latest Past Events</Text>
                {filteredPast.map((e, i, arr) => renderEvent(e, i, arr))}
              </>
            )}

            {filteredUpcoming.length === 0 && filteredPast.length === 0 && searchText !== '' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No events found for "{searchText}"</Text>
              </View>
            )}
          </>
        )}

        {!loading && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tacoma Rescue Mission{'\n'}
              425 South Tacoma Way, Tacoma WA 98402{'\n'}
              253.383.4493
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.trm.org/events/')}>
              <Text style={styles.footerLink}>View full events page at trm.org</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  pageHeader: {
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F7F7', borderRadius: 6,
    borderWidth: 1, borderColor: '#DDDDDD',
    paddingHorizontal: 10, height: 40,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#2C1810' },
  findBtn: {
    backgroundColor: '#C0392B', borderRadius: 6,
    paddingHorizontal: 14, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  findBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  viewToggleRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10,
    gap: 8, borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  viewToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 4, borderWidth: 1, borderColor: '#DDDDDD',
    backgroundColor: '#F7F7F7',
  },
  viewToggleBtnActive: { backgroundColor: '#C0392B', borderColor: '#C0392B' },
  viewToggleLabel: { fontSize: 12, color: '#555', fontWeight: '600' },
  viewToggleLabelActive: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  loadingText: { fontSize: 14, color: '#888888' },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    backgroundColor: '#C0392B', borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  noUpcomingBox: { paddingHorizontal: 20, paddingVertical: 18 },
  noUpcomingText: { fontSize: 14, color: '#555555', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#EBEBEB' },
  sectionHeading: {
    fontSize: 20, fontWeight: '800', color: '#2C1810',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  eventRow: {
    flexDirection: 'row', paddingHorizontal: 20,
    paddingVertical: 20, alignItems: 'flex-start', gap: 16,
  },
  dateBlock: { width: 52, alignItems: 'center', flexShrink: 0 },
  dateMonth: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    color: '#FFFFFF', backgroundColor: '#C0392B',
    width: 52, textAlign: 'center', paddingVertical: 4,
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  dateDay: {
    fontSize: 30, fontWeight: '800', color: '#2C1810', lineHeight: 36,
    width: 52, textAlign: 'center',
    borderWidth: 1, borderTopWidth: 0, borderColor: '#DDDDDD',
    paddingBottom: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  eventBody: { flex: 1 },
  eventImage: {
    width: '100%', height: 160, borderRadius: 6,
    backgroundColor: '#F0F0F0', marginBottom: 10,
  },
  eventDatetime: { fontSize: 12, color: '#888888', marginBottom: 6 },
  eventTitle: {
    fontSize: 16, fontWeight: '800', color: '#C0392B',
    lineHeight: 22, marginBottom: 6,
  },
  eventVenue: { fontSize: 13, fontWeight: '600', color: '#2C1810', marginBottom: 2 },
  eventAddress: { fontSize: 12, color: '#888888', marginBottom: 8 },
  eventDescription: { fontSize: 13, color: '#444444', lineHeight: 20, marginBottom: 8 },
  priceText: { fontSize: 13, fontWeight: '700', color: '#2C1810' },
  eventDivider: { height: 1, backgroundColor: '#EBEBEB', marginHorizontal: 20 },
  emptyState: { paddingHorizontal: 20, paddingVertical: 30, alignItems: 'center' },
  emptyStateText: { fontSize: 14, color: '#888888', fontStyle: 'italic' },
  footer: {
    marginTop: 30, paddingHorizontal: 20, paddingVertical: 20,
    borderTopWidth: 1, borderTopColor: '#EBEBEB', gap: 10,
  },
  footerText: { fontSize: 12, color: '#888888', lineHeight: 20 },
  footerLink: { fontSize: 12, color: '#C0392B', fontWeight: '600', textDecorationLine: 'underline' },
});
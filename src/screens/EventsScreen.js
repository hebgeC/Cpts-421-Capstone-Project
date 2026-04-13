import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, TextInput, Image, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const EVENTS_URL = 'https://www.trm.org/events/';

// Month name -> 3-letter abbreviation lookup
const MONTH_MAP = {
  january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
  may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
  september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
};

// Strip all HTML tags and decode common entities
function clean(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\[&hellip;\]/g, '...')
    .replace(/\[…\]/g, '...')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseEvents(html) {
  const events = [];

  // The TRM site (The Events Calendar plugin) wraps each event in <article ...>
  const blocks = html.split(/<article\s/);
  // skip index 0 — it's everything before the first article
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    // ── URL ── must be a /events/ permalink
    const urlMatch = block.match(/href="(https:\/\/www\.trm\.org\/events\/[^"#?]+)"/);
    if (!urlMatch) continue;
    const url = urlMatch[1];

    // ── Title ── inside an <h2> or <h3> tag that contains the URL
    // Pattern: <h2 ...><a href="...EVENT_URL...">TITLE</a></h2>
    const titleMatch = block.match(
      /<h[23][^>]*>[\s\S]*?<a[^>]+href="[^"]*\/events\/[^"]*"[^>]*>([\s\S]*?)<\/a>/i
    );
    if (!titleMatch) continue;
    const title = clean(titleMatch[1]);

    // ── Image ── first wp-content/uploads image in the block
    const imgMatch = block.match(
      /src="(https:\/\/www\.trm\.org\/wp-content\/uploads\/[^"]+\.(png|jpg|jpeg|webp))"/i
    );
    const image = imgMatch ? imgMatch[1] : null;

    // ── Datetime string ──
    // The site outputs: "November 27, 2025 @ 3:00 PM - 6:00 PM"
    // or: "September 28, 2025 @ 3:30 PM - 4:30 PM"
    const datetimeMatch = block.match(
      /([A-Z][a-z]+ \d{1,2}, \d{4} @ \d{1,2}:\d{2} [AP]M\s*[-–]\s*\d{1,2}:\d{2} [AP]M)/
    );
    const datetime = datetimeMatch ? datetimeMatch[1].trim() : '';

    // ── Month and Day ──
    // Derive from the datetime string — most reliable source
    let month = '';
    let day = '';
    if (datetimeMatch) {
      // e.g. "November 27, 2025 @ ..."
      const parts = datetimeMatch[1].split(' ');
      const fullMonth = parts[0].toLowerCase();
      month = MONTH_MAP[fullMonth] || parts[0].substring(0, 3);
      day = parseInt(parts[1].replace(',', '').trim(), 10).toString();
    } else {
      // Fallback: look for the plain-text date block the site emits:
      // "Nov \n\n27 \n\n2025" between the article tags
      const monthTextMatch = block.match(
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i
      );
      const dayTextMatch = block.match(/\b(\d{1,2})\b[\s\S]{0,30}?\b(20\d{2})\b/);
      if (monthTextMatch) {
        month = MONTH_MAP[monthTextMatch[1].toLowerCase()] || monthTextMatch[1].substring(0, 3);
      }
      if (dayTextMatch) {
        day = dayTextMatch[1];
      }
    }

    // ── Venue name ──
    // The Events Calendar wraps it in class="tribe-venue"
    const venueMatch = block.match(
      /class="tribe-venue"[^>]*>([\s\S]*?)<\/(?:address|div|span|p)>/i
    ) || block.match(/tribe-venue-name[^>]*>([\s\S]*?)<\/(?:span|div|p|address)>/i);
    const venue = venueMatch ? clean(venueMatch[1]) : '';

    // ── Address ──
    const addrMatch = block.match(
      /tribe-address[^>]*>([\s\S]*?)<\/address>/i
    ) || block.match(/tribe-full-address[^>]*>([\s\S]*?)<\//i);
    const address = addrMatch ? clean(addrMatch[1]) : '';

    // ── Description excerpt ──
    const descMatch = block.match(
      /tribe-event-description[^>]*>([\s\S]*?)<\/(?:p|div)>/i
    );
    const description = descMatch ? clean(descMatch[1]) : '';

    // ── Price ──
    // The site shows "$12.23" inside class="tribe-event-cost"
    const priceMatch = block.match(/tribe-event-cost[^>]*>([\s\S]*?)<\//i);
    let price = null;
    if (priceMatch) {
      const priceText = clean(priceMatch[1]);
      if (priceText && priceText !== 'Free' && priceText.length > 0) {
        price = priceText.startsWith('$') ? priceText : `$${priceText}`;
      }
    }
    // Fallback: look for a standalone dollar amount in the block
    if (!price) {
      const dollarMatch = block.match(/\$(\d+\.\d{2})/);
      if (dollarMatch) price = `$${dollarMatch[1]}`;
    }

    events.push({ id: url, month, day, datetime, title, url, image, venue, address, description, price });
  }

  return events;
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
      const res = await fetch(EVENTS_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
      });
      const html = await res.text();

      setNoUpcoming(html.includes('There are no upcoming events'));

      // Split the HTML at the "Latest Past Events" heading
      const splitIndex = html.search(/Latest Past Events/i);
      const upcomingHtml = splitIndex > 0 ? html.substring(0, splitIndex) : html;
      const pastHtml = splitIndex > 0 ? html.substring(splitIndex) : '';

      setUpcomingEvents(parseEvents(upcomingHtml));
      setPastEvents(parseEvents(pastHtml));
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
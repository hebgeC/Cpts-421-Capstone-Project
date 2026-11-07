import { decodeEntities } from './text';

const EVENTS_API_URL = process.env.EXPO_PUBLIC_EVENTS_API_URL
  || 'https://www.trm.org/wp-json/tribe/events/v1/events';

export async function getEvents({ page = 1, perPage = 20, startDate, endDate } = {}) {
  const params = { page, per_page: perPage, start_date: startDate, end_date: endDate };
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const response = await fetch(`${EVENTS_API_URL}?${query}`);
  if (!response.ok) throw new Error(`Events request failed: ${response.status}`);
  const data = await response.json();
  return {
    events: (data.events || []).map((event) => ({
      id: event.id,
      title: decodeEntities(event.title),
      description: decodeEntities(event.description),
      url: event.url,
      image: event.image?.url || null,
      startDate: event.start_date,
      endDate: event.end_date,
      allDay: Boolean(event.all_day),
      venue: event.venue?.venue || '',
      address: [event.venue?.address, event.venue?.city, event.venue?.state, event.venue?.zip]
        .filter(Boolean).join(', '),
      cost: event.cost || null,
    })),
    total: data.total,
    totalPages: data.total_pages,
  };
}

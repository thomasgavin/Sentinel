import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { EventRow } from '../components/EventRow';
import { SentinelEvent, EventType } from '../types';
import { C, EVENT_COLOR, EVENT_ICON } from '../theme';

type FilterKey = 'all' | 'family' | 'visitors' | 'deliveries' | 'motion' | 'alerts';

const FILTERS: { key: FilterKey; label: string; types?: EventType[] }[] = [
  { key: 'all',        label: 'All' },
  { key: 'family',     label: 'Family',    types: ['family_arrival', 'family_departure'] },
  { key: 'visitors',   label: 'Visitors',  types: ['unknown_person'] },
  { key: 'deliveries', label: 'Deliveries', types: ['package_delivery'] },
  { key: 'motion',     label: 'Motion',    types: ['motion_resolved'] },
  { key: 'alerts',     label: 'Alerts',    types: ['threat'] },
];

export const ActivityScreen: React.FC = () => {
  const { events, clearUnread } = useStore();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all'
    ? events
    : events.filter(e => FILTERS.find(f => f.key === filter)?.types?.includes(e.type));

  const renderItem: ListRenderItem<SentinelEvent> = useCallback(
    ({ item }) => <EventRow event={item} />,
    []
  );

  const renderHeader = () => (
    <>
      {/* Page header */}
      <View style={[styles.pageHeader, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.heading}>Activity</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{events.length}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
            {f.key !== 'all' && (
              <Text style={[styles.chipCount, filter === f.key && { color: C.accent }]}>
                {events.filter(e => f.types?.includes(e.type)).length}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Section date label */}
      <Text style={styles.dateLabel}>
        Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle" size={36} color={C.t3} />
      <Text style={styles.emptyTitle}>Nothing here</Text>
      <Text style={styles.emptySub}>No events match this filter</Text>
    </View>
  );

  return (
    <View style={[styles.root]}>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={clearUnread}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  flatList: { flex: 1 },
  list:     {},

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  heading: { color: C.text, fontSize: 20, fontWeight: '700' },
  countBadge: {
    backgroundColor: C.s3,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: { color: C.t2, fontSize: 11, fontWeight: '600' },

  filterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: C.s2,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.accentDim,
    borderColor: `${C.accent}66`,
  },
  chipText:       { color: C.t2,   fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: C.accent },
  chipCount:      { color: C.t3,   fontSize: 11 },

  dateLabel: {
    color: C.t3,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: { color: C.t2, fontSize: 15, fontWeight: '600' },
  emptySub:   { color: C.t3, fontSize: 13 },
});

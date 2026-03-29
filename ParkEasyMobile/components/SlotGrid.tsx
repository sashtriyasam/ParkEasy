import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ParkingSlot } from '../types';
import { SLOT_STATUS_COLORS, colors } from '../constants/colors';

interface SlotGridProps {
  slots: ParkingSlot[];
  onSlotPress: (slot: ParkingSlot) => void;
  selectedSlotId: string | null;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ slots, onSlotPress, selectedSlotId }) => {
  const renderItem = ({ item }: { item: ParkingSlot }) => {
    const isSelected = item.id === selectedSlotId;
    const isFree = item.status === 'free';
    const dotColor = SLOT_STATUS_COLORS[item.status] || colors.textMuted;

    return (
      <TouchableOpacity
        style={[
          styles.slotContainer,
          isSelected && styles.slotSelected,
          !isFree && styles.slotDisabled,
        ]}
        onPress={() => onSlotPress(item)}
        disabled={!isFree}
        activeOpacity={0.7}
      >
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.slotNumber}>{item.slotNumber}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={5}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
      <View style={styles.legendContainer}>
        {Object.entries(SLOT_STATUS_COLORS).map(([status, color]) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{status.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  slotContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  slotSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  slotDisabled: {
    opacity: 0.5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  slotNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ParkingSlot } from '../types';
import { SLOT_STATUS_COLORS, colors } from '../constants/colors';

interface SlotGridProps {
  slots: ParkingSlot[];
  onSlotPress: (slot: ParkingSlot) => void;
  selectedSlotId: string | null;
  highlightedSlotId?: string | null;
}

const SlotItem: React.FC<{
  item: ParkingSlot;
  isSelected: boolean;
  isHighlighted: boolean;
  onPress: (slot: ParkingSlot) => void;
}> = ({ item, isSelected, isHighlighted, onPress }) => {
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(2000),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHighlighted]);

  const isFree = item.status === 'free';
  const dotColor = SLOT_STATUS_COLORS[item.status] || colors.textMuted;

  const borderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isSelected ? colors.primary : 'transparent', '#FACC15'], // yellow-400
  });

  const borderWidth = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isSelected ? 2 : 0, 3],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      disabled={!isFree}
    >
      <Animated.View
        style={[
          styles.slotContainer,
          { borderColor, borderWidth },
          !isFree && styles.slotDisabled,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.slotNumber}>{item.slotNumber}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const SlotGrid: React.FC<SlotGridProps> = ({ 
  slots, 
  onSlotPress, 
  selectedSlotId,
  highlightedSlotId 
}) => {
  const renderItem = ({ item }: { item: ParkingSlot }) => (
    <SlotItem
      item={item}
      isSelected={item.id === selectedSlotId}
      isHighlighted={item.id === highlightedSlotId}
      onPress={onSlotPress}
    />
  );

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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


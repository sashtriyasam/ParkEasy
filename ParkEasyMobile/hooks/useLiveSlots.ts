import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { ParkingSlot } from '../types';

export const useLiveSlots = (facilityId: string, initialSlots: ParkingSlot[]) => {
  const [slots, setSlots] = useState<ParkingSlot[]>(initialSlots);
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);
  const { socket, joinFacility, leaveFacility } = useSocket();
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  useEffect(() => {
    if (!facilityId) return;

    // Join room on mount
    joinFacility(facilityId);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    const onSlotUpdated = (payload: { 
      slotId: string, 
      status: ParkingSlot['status'], 
      facilityId: string 
    }) => {
      if (payload.facilityId === facilityId) {
        setSlots(currentSlots => 
          currentSlots.map(slot => 
            slot.id === payload.slotId 
              ? { ...slot, status: payload.status }
              : slot
          )
        );
        
        // Highlight the updated slot
        setHighlightedSlotId(payload.slotId);
        setTimeout(() => setHighlightedSlotId(null), 2500);
      }
    };

    socket?.on('connect', onConnect);
    socket?.on('disconnect', onDisconnect);
    socket?.on('slot_updated', onSlotUpdated);

    return () => {
      // Leave room and clean up listeners on unmount
      leaveFacility(facilityId);
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('slot_updated', onSlotUpdated);
    };
  }, [facilityId, socket]);

  return { slots, isConnected, highlightedSlotId };
};

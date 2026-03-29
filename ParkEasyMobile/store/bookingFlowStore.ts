import { create } from 'zustand';
import { ParkingSlot, Vehicle, VehicleType, PaymentMethod } from '../types';

interface BookingFlowState {
  facilityId: string | null;
  facilityName: string | null;
  selectedSlot: ParkingSlot | null;
  selectedVehicle: Vehicle | null;
  vehicleNumber: string;
  vehicleType: VehicleType | null;
  selectedPaymentMethod: PaymentMethod | null;
  estimatedCost: number | null;
  createdTicketId: string | null;
  
  setFacility: (id: string, name: string) => void;
  setSlot: (slot: ParkingSlot) => void;
  setVehicle: (vehicle: Vehicle | null, number: string, type: VehicleType | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setEstimatedCost: (cost: number) => void;
  setCreatedTicket: (id: string) => void;
  resetBookingFlow: () => void;
}

const initialState = {
  facilityId: null,
  facilityName: null,
  selectedSlot: null,
  selectedVehicle: null,
  vehicleNumber: '',
  vehicleType: null,
  selectedPaymentMethod: null,
  estimatedCost: null,
  createdTicketId: null,
};

export const useBookingFlowStore = create<BookingFlowState>((set) => ({
  ...initialState,
  
  setFacility: (id, name) => set({ facilityId: id, facilityName: name }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setVehicle: (vehicle, number, type) => set({ selectedVehicle: vehicle, vehicleNumber: number, vehicleType: type }),
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setEstimatedCost: (cost) => set({ estimatedCost: cost }),
  setCreatedTicket: (id) => set({ createdTicketId: id }),
  resetBookingFlow: () => set(initialState),
}));

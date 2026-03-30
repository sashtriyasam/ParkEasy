import { create } from 'zustand';
import { ParkingSlot, Vehicle, VehicleType, PaymentMethod } from '../types';

interface BookingFlowState {
  facility_id: string | null;
  facility_name: string | null;
  selected_slot: ParkingSlot | null;
  selected_vehicle: Vehicle | null;
  vehicle_number: string;
  vehicle_type: VehicleType | null;
  selected_payment_method: PaymentMethod | null;
  estimated_cost: number | null;
  created_ticket_id: string | null;
  
  setFacility: (id: string, name: string) => void;
  setSlot: (slot: ParkingSlot) => void;
  setVehicle: (vehicle: Vehicle | null, number: string, type: VehicleType | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setEstimatedCost: (cost: number) => void;
  setCreatedTicket: (id: string) => void;
  resetBookingFlow: () => void;
}

const initialState = {
  facility_id: null,
  facility_name: null,
  selected_slot: null,
  selected_vehicle: null,
  vehicle_number: '',
  vehicle_type: null,
  selected_payment_method: null,
  estimated_cost: null,
  created_ticket_id: null,
};

export const useBookingFlowStore = create<BookingFlowState>((set) => ({
  ...initialState,
  
  setFacility: (id, name) => set({ facility_id: id, facility_name: name }),
  setSlot: (slot) => set({ selected_slot: slot }),
  setVehicle: (vehicle, number, type) => set({ selected_vehicle: vehicle, vehicle_number: number, vehicle_type: type }),
  setPaymentMethod: (method) => set({ selected_payment_method: method }),
  setEstimatedCost: (cost) => set({ estimated_cost: cost }),
  setCreatedTicket: (id) => set({ created_ticket_id: id }),
  resetBookingFlow: () => set(initialState),
}));

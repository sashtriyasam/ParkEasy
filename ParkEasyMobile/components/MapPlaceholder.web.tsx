import React from 'react';
import { View } from 'react-native';

export const MapView = ({ style, ...props }: any) => (
  <View 
    {...props} 
    style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }, style]}
    accessibilityRole="summary"
    accessibilityLabel="Map preview not available on web"
  />
);

export const Marker = (props: any) => (
  <View 
    {...props}
    style={[{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' }, props.style]} 
    accessibilityLabel={props.accessibilityLabel || "Location pointer"}
  />
);
export const PROVIDER_GOOGLE = null;
export default MapView;

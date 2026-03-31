import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureException } from '../utils/reporting';

interface Props { 
  children: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  onReset?: () => void;
}
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, info.componentStack);
    
    // Notify production reporting service
    captureException(error, { componentStack: info.componentStack });

    // Notify parent if callback provided
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={64} color="#FF6B6B" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The application encountered an unexpected issue while loading this screen. Our team has been notified.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={this.handleReset}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Retries the last operation"
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', marginTop: 16 },
  message: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  button: { backgroundColor: '#1a73e8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInUp,
  Layout,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { get } from '../../services/api';
import { searchLocation, LocationSuggestion } from '../../services/geocoding';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { colors } from '../../constants/colors';
import { ParkingFacility, VehicleType } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';

const { width, height } = Dimensions.get('window');

type SearchMode = 'NAME' | 'COORD';

const VEHICLE_FILTERS: { label: string; value: VehicleType; icon: any }[] = [
  { label: 'BIKE', value: 'bike', icon: 'bicycle' },
  { label: 'SCOOTER', value: 'scooter', icon: 'bicycle-outline' },
  { label: 'CAR', value: 'car', icon: 'car' },
  { label: 'TRUCK', value: 'truck', icon: 'bus' },
];

const Particle = ({ delay = 0 }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-height, {
          duration: Math.random() * 5000 + 5000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 2500 }),
          withTiming(0.1, { duration: 2500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { 
          left: Math.random() * width, 
          top: height + 20,
        }, 
        animatedStyle
      ]} 
    />
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('NAME');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [results, setResults] = useState<ParkingFacility[]>([]);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const loaderRotation = useSharedValue(0);

  useEffect(() => {
    loaderRotation.value = withRepeat(
      withTiming(360, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const handleSearch = useCallback(async (q: string, m: SearchMode, type: VehicleType | null) => {
    if (!q) {
      setResults([]);
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    try {
      if (m === 'NAME') {
        let url = `/parking/search?query=${encodeURIComponent(q)}`;
        if (type) url += `&vehicle_type=${type}`;
        const res = await get(url);
        setResults(res.data.data || []);
      } else {
        const locs = await searchLocation(q);
        setSuggestions(locs);
      }
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query, mode, vehicleType);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, mode, vehicleType, handleSearch]);

  const toggleMode = (m: SearchMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(m);
    setQuery('');
    setResults([]);
    setSuggestions([]);
    searchInputRef.current?.focus();
  };

  const handleSuggestionPress = async (suggestion: LocationSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const url = `/parking/search?lat=${suggestion.lat}&lon=${suggestion.lon}&limit=10`;
      const res = await get(url);
      setResults(res.data.data || []);
      setSuggestions([]);
      setMode('NAME'); 
      setQuery(suggestion.display_name.split(',')[0]);
    } catch (e) {
      console.error('Suggestion fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const renderLoader = () => (
    <Animated.View style={{ transform: [{ rotate: `${loaderRotation.value}deg` }] }}>
      <Ionicons name="sync" size={18} color={colors.primary} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />
      
      {/* Immersive Background Elements */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Particle key={i} delay={i * 400} />
      ))}
      
      <View style={[styles.glow, { top: height * 0.1, right: -50, backgroundColor: colors.primary + '20' }]} />
      <View style={[styles.glow, { bottom: height * 0.2, left: -50, backgroundColor: colors.primary + '10' }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Futuristic Search Header */}
        <Animated.View entering={SlideInUp.duration(600)} style={styles.header}>
          <BlurView intensity={30} tint="dark" style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.protocolInfo}>
                 <Text style={styles.protocolTitle}>INTEL SCAN NODE</Text>
                 <Text style={styles.protocolSub}>PROTOCOL: {mode === 'NAME' ? 'NAME_TRACE' : 'COORD_SCAN'}</Text>
              </View>
              <View style={styles.statusBadge}>
                 <View style={styles.statusDot} />
                 <Text style={styles.statusText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.modeSwitcherHost}>
               <TouchableOpacity 
                  onPress={() => toggleMode('NAME')}
                  style={[styles.modeBtn, mode === 'NAME' && styles.modeBtnActive]}
               >
                  <Text style={[styles.modeText, mode === 'NAME' && styles.modeTextActive]}>NAME_TRACE</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                  onPress={() => toggleMode('COORD')}
                  style={[styles.modeBtn, mode === 'COORD' && styles.modeBtnActive]}
               >
                  <Text style={[styles.modeText, mode === 'COORD' && styles.modeTextActive]}>COORD_SCAN</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.inputHost}>
               <View style={styles.glassInputBox}>
                  <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                  <Ionicons 
                    name={mode === 'NAME' ? "search-outline" : "location-outline"} 
                    size={20} 
                    color={colors.primary} 
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={mode === 'NAME' ? "Trace facility or node..." : "Input grid coordinates..."}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={query}
                    onChangeText={setQuery}
                    selectionColor={colors.primary}
                    autoFocus
                  />
                  {loading && renderLoader()}
                  {!loading && query.length > 0 && (
                    <TouchableOpacity onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setQuery('');
                    }}>
                       <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  )}
               </View>
            </View>

            {mode === 'NAME' && (
              <View style={styles.filtersWrapper}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={VEHICLE_FILTERS}
                  keyExtractor={(item) => item.value}
                  contentContainerStyle={styles.filtersContent}
                  renderItem={({ item }) => {
                    const isActive = vehicleType === item.value;
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setVehicleType(isActive ? null : item.value as VehicleType);
                        }}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                      >
                        <BlurView intensity={isActive ? 40 : 10} tint="dark" style={StyleSheet.absoluteFill} />
                        <Ionicons
                          name={item.icon as any}
                          size={14}
                          color={isActive ? colors.primary : 'rgba(255,255,255,0.5)'}
                        />
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* Results / Suggestions Grid */}
        {mode === 'COORD' && suggestions.length > 0 ? (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            contentContainerStyle={styles.suggestionList}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 50)}>
                <TouchableOpacity 
                   style={styles.suggestionItem}
                   onPress={() => handleSuggestionPress(item)}
                >
                   <BlurView intensity={10} tint="dark" style={styles.suggestionBlur}>
                      <View style={styles.suggestionIconBox}>
                         <Ionicons name="map-outline" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.suggestionInfo}>
                         <Text style={styles.suggestionTitle} numberOfLines={1}>
                            {item.display_name.split(',')[0]}
                         </Text>
                         <Text style={styles.suggestionSub} numberOfLines={1}>
                            {item.display_name.split(',').slice(1).join(',')}
                         </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                   </BlurView>
                </TouchableOpacity>
              </Animated.View>
            )}
            ListHeaderComponent={
              <Text style={styles.sectionHeader}>GRID MATCHES DETECTED</Text>
            }
          />
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View
                layout={LinearTransition.springify()}
                entering={FadeInDown.delay(index * 100)}
                style={styles.resultWrapper}
              >
                <ParkingFacilityCard
                  facility={item}
                  distance={item.distance}
                  onPress={() => router.push(`/(customer)/facility/${item.id}`)}
                  style={{ width: '100%', marginRight: 0 }}
                />
              </Animated.View>
            )}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                 <Text style={styles.resultsCount}>TRACE COMPLETE: {results.length} NODES</Text>
                 <View style={styles.resultsLine} />
              </View>
            }
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState
              icon={query.length > 0 ? "eye-off-outline" : "wifi-outline"}
              title={query.length > 0 ? "ZERO MATCHES" : "SCAN INITIALIZED"}
              subtitle={query.length > 0
                ? "Keyword mismatch. Adjust grid parameters."
                : "Scanning for nearby parking infrastructure..."}
              actionLabel={query.length > 0 ? "RESET TRACE" : undefined}
              onAction={query.length > 0 ? () => { setQuery(''); setVehicleType(null); } : undefined}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(50px)',
  },
  header: {
    zIndex: 100,
  },
  headerContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  protocolInfo: {
    flex: 1,
    marginLeft: 16,
  },
  protocolTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  protocolSub: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  modeSwitcherHost: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 2,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modeText: {
     fontSize: 9,
     fontWeight: '900',
     color: 'rgba(255,255,255,0.3)',
     letterSpacing: 1,
  },
  modeTextActive: {
     color: colors.primary,
  },
  inputHost: {
    paddingHorizontal: 20,
  },
  glassInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  filtersWrapper: {
    marginTop: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  filterChipActive: {
    borderColor: colors.primary + '50',
  },
  chipText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  chipTextActive: {
    color: colors.primary,
  },
  suggestionList: {
    padding: 24,
    paddingTop: 30,
  },
  suggestionItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  suggestionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  suggestionIconBox: {
     width: 36,
     height: 36,
     borderRadius: 10,
     backgroundColor: colors.primary + '10',
     alignItems: 'center',
     justifyContent: 'center',
     marginRight: 14,
  },
  suggestionInfo: {
     flex: 1,
  },
  suggestionTitle: {
     fontSize: 14,
     fontWeight: '800',
     color: '#FFF',
  },
  suggestionSub: {
     fontSize: 9,
     color: 'rgba(255,255,255,0.4)',
     fontWeight: '700',
     marginTop: 2,
  },
  sectionHeader: {
     fontSize: 10,
     fontWeight: '900',
     color: 'rgba(255,255,255,0.3)',
     letterSpacing: 2,
     marginBottom: 16,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  resultsHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 16,
     marginBottom: 24,
  },
  resultsCount: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    opacity: 0.8,
  },
  resultsLine: {
     flex: 1,
     height: 1,
     backgroundColor: colors.primary + '20',
  },
  resultWrapper: {
    marginBottom: 20,
  },
});

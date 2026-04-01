import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { GlassButton } from '../components/ui/GlassButton';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay = 0 }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);
  const leftX = useSharedValue(Math.random() * width);

  useEffect(() => {
    translateY.value = withDelay(delay, withRepeat(
      withTiming(-height - 100, { duration: 20000 + Math.random() * 10000, easing: Easing.linear }),
      -1,
      false
    ));
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 3000 }),
        withTiming(0.1, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    left: leftX.value,
    top: height + 50,
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};

export default function SplashScreen() {
  const router = useRouter();
  const float = useSharedValue(0);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Layer */}
      <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />
      
      <View style={StyleSheet.absoluteFill}>
        {[...Array(25)].map((_, i) => (
          <Particle key={i} delay={i * 1000} />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.delay(300).duration(1200)}
          style={[styles.logoHost, floatStyle]}
        >
          <View style={styles.logoGlass}>
            <BlurView intensity={30} tint="dark" style={styles.logoBlur}>
              <Text style={styles.logoText}>P</Text>
            </BlurView>
            <View style={styles.logoFrame} />
          </View>
          
          <Animated.View style={[styles.mainGlow, glowStyle]}>
            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
          </Animated.View>
          
          <View style={styles.orbitWrapper}>
            <View style={styles.orbit} />
            <View style={[styles.orbit, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.orbit, { transform: [{ rotate: '-45deg' }] }]} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(1000)} style={styles.textContainer}>
          <Text style={styles.title}>PARKEASY</Text>
          <Text style={styles.subtitle}>PROTOCOL PHASE: INITIALIZATION</Text>
          <Text style={styles.tagline}>Intelligent Node Access • Real-time Sovereignty</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(1000).duration(1000)} style={styles.footer}>
        <GlassButton 
          label="INITIALIZE ACCESS" 
          onPress={() => router.push('/(auth)/signup')} 
          variant="primary"
          style={styles.button}
        />
        <GlassButton 
          label="RESTORE SESSION" 
          onPress={() => router.push('/(auth)/login')} 
          variant="secondary"
          style={styles.ghostButton}
        />
        
        <View style={styles.versionContainer}>
           <Text style={styles.versionText}>CORE v2.0.4 • SECURED BY ANTIGRAVITY</Text>
        </View>
      </Animated.View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHost: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoGlass: {
    width: 100,
    height: 100,
    borderRadius: 32,
    overflow: 'hidden',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowColor: colors.primary,
    textShadowRadius: 10,
  },
  logoFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 32,
  },
  mainGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    zIndex: 1,
  },
  orbitWrapper: {
    position: 'absolute',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 12,
    opacity: 0.8,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    padding: 32,
    paddingBottom: 60,
  },
  button: {
    marginBottom: 16,
  },
  ghostButton: {
    height: 56,
  },
  versionContainer: {
    marginTop: 32,
    alignItems: 'center',
    opacity: 0.3,
  },
  versionText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

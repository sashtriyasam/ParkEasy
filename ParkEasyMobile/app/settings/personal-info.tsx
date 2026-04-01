import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useToast } from '../../components/Toast';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('IDENTITY SYNCED SUCCESSFULLY', 'success');
    }, 1500);
  };

  const handleInitializeAccountTermination = () => {
    Alert.alert(
      "TERMINATION PROTOCOL",
      "WARNING: Initializing account termination will permanently purge all node access coordinates and identity logs. This action is irreversible. Proceed with termination?",
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "CONFIRM TERMINATION", 
          style: "destructive",
          onPress: () => {
            showToast('TERMINATION SEQUENCE INITIATED', 'error');
            // In a real app, this would call an API then log out
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
         <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <BlurView intensity={20} tint="dark" style={styles.navBlur}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </BlurView>
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>IDENTITY CORE</Text>
            <Text style={styles.headerSubtitle}>PROTOCOL PHASE: IDENTITY MGMT</Text>
         </View>
         <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
            <Text style={styles.shieldText}>SECURED</Text>
         </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={ZoomIn.delay(200)} style={styles.avatarSection}>
            <View style={styles.avatarHost}>
              <View style={styles.avatarGlass}>
                <BlurView intensity={30} tint="dark" style={styles.avatarBlur}>
                   <Text style={styles.avatarInitial}>{(formData.name.trim().charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()}</Text>
                </BlurView>
              </View>
              <View style={styles.avatarGlow}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              </View>
              <TouchableOpacity style={styles.editBadge}>
                 <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.operatorId}>OPERATOR_ID: {user?.id?.slice(0, 8).toUpperCase()}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <GlassCard style={styles.formCard}>
              <View style={styles.formLabel}>
                <Ionicons name="finger-print-outline" size={14} color={colors.primary} />
                <Text style={styles.formLabelText}>NODE ACCESS COORDINATES</Text>
              </View>

              <GlassInput 
                label="FULL LEGAL NAME" 
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
                placeholder="OPERATOR_NAME"
                icon="person-outline"
              />

              <GlassInput 
                label="IDENTITY SIGNATURE (EMAIL)" 
                value={formData.email}
                editable={false}
                icon="mail-outline"
              />
              <Text style={styles.lockedHint}>IDENTITY SIGNATURE IS PERMANENTLY BOUND TO NODE.</Text>

              <GlassInput 
                label="KINETIC CONTACT (PHONE)" 
                value={formData.phone}
                onChangeText={(t) => setFormData({...formData, phone: t})}
                placeholder="+91 00000 00000"
                keyboardType="phone-pad"
                icon="call-outline"
              />

              <View style={styles.actionHost}>
                <GlassButton 
                  label={loading ? "SYNCING..." : "COMMIT CHANGES"} 
                  onPress={handleUpdate} 
                  variant="primary"
                  loading={loading}
                />
              </View>

              <TouchableOpacity 
                style={styles.terminationBtn}
                onPress={handleInitializeAccountTermination}
              >
                <Text style={styles.terminationText}>INITIALIZE ACCOUNT TERMINATION</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          <View style={styles.footerNote}>
             <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.2)" />
             <Text style={styles.footerNoteText}>ALL IDENTITY MODIFICATIONS ARE LOGGED IN THE AUDIT TRAIL</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  shieldText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarHost: {
    width: 110,
    height: 110,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlass: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  avatarBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: colors.primary,
    textShadowRadius: 10,
  },
  avatarGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGlow,
    overflow: 'hidden',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 3,
    borderColor: '#161B2E',
  },
  operatorId: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 2,
  },
  formCard: {
    padding: 24,
  },
  formLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    opacity: 0.8,
  },
  formLabelText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  lockedHint: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '800',
    marginTop: -8,
    marginBottom: 20,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  actionHost: {
    marginTop: 20,
  },
  terminationBtn: {
    alignItems: 'center',
    marginTop: 32,
  },
  terminationText: {
    color: 'rgba(255,69,58,0.6)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    opacity: 0.4,
  },
  footerNoteText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

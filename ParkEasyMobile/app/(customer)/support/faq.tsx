import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { GlassCard } from '../../../components/ui/GlassCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    category: 'Booking & Payments',
    questions: [
      { q: 'How do I book a parking slot?', a: 'Search for a facility on the Home or Search screen, select your vehicle type, and choose a free slot. Confirm the booking and you are ready to go!' },
      { q: 'What is "Pay at Exit"?', a: 'You can park your vehicle without paying upfront. When you leave, the attendant will scan your QR code and calculate the fee based on your duration.' },
      { q: 'Is my payment secure?', a: 'Yes, all payments are handled by Razorpay with industry-standard PCI-DSS encryption.' }
    ]
  },
  {
    category: 'Facility & Arrival',
    questions: [
      { q: 'How do I enter the parking area?', a: 'Show the Access QR code from your "Tickets" screen to the attendant at the gate. They will scan it to record your entry.' },
      { q: 'Can I extend my parking stay?', a: 'For active bookings, stay as long as you need. The final amount will be calculated at exit based on the total hours.' }
    ]
  },
  {
    category: 'Technical Issues',
    questions: [
      { q: 'My QR code is not scanning.', a: 'Ensure your screen brightness is at maximum. If it still fails, the attendant can manually entry your Vehicle Number.' },
      { q: 'Can I cancel my booking?', a: 'Currently, cancellations are not supported once you have entered the facility. If you have not entered, the booking will expire automatically.' }
    ]
  }
];

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
      </View>

      {FAQS.map((section, sIndex) => (
        <View key={sIndex} style={styles.section}>
          <Text style={styles.categoryTitle}>{section.category}</Text>
          {section.questions.map((item, qIndex) => {
            const id = `${sIndex}-${qIndex}`;
            const isExpanded = expandedId === id;
            return (
              <TouchableOpacity 
                key={id} 
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]} 
                onPress={() => toggleExpand(id)}
                activeOpacity={0.8}
              >
                <View style={styles.qRow}>
                  <Text style={styles.questionText}>{item.q}</Text>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={18} 
                    color={isExpanded ? colors.primary : colors.textMuted} 
                  />
                </View>
                {isExpanded && (
                  <View style={styles.aRow}>
                    <Text style={styles.answerText}>{item.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <GlassCard style={styles.contactCard} intensity={10}>
        <Ionicons name="chatbubbles" size={32} color={colors.primary} />
        <Text style={styles.contactTitle}>Still have questions?</Text>
        <Text style={styles.contactSub}>Our team is available 24/7 for assistance.</Text>
        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactBtnText}>Chat with Support</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  faqCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqCardExpanded: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '05',
  },
  qRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 12,
  },
  aRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  contactCard: {
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: colors.textPrimary,
  },
  contactSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  contactBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

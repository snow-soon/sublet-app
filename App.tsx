import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  AppMode,
  Property,
  SeekerCard,
  MOCK_PROPERTIES,
  MOCK_SEEKER_CARDS,
} from './src/data';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// ─── Colour tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#FF5A5F',
  success: '#00C853',
  danger:  '#FF1744',
  bg:      '#F7F7F7',
  card:    '#FFFFFF',
  muted:   '#888888',
  white:   '#FFFFFF',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const [, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// ─── Gender Tag ───────────────────────────────────────────────────────────────
function GenderTag({ gender }: { gender: string }) {
  const iconName =
    gender === 'Female' ? 'female' :
    gender === 'Male'   ? 'male'   : 'transgender';
  const color =
    gender === 'Female' ? '#E91E8C' :
    gender === 'Male'   ? '#1565C0' : '#7B1FA2';
  return (
    <View style={[styles.genderTag, { borderColor: color }]}>
      <Ionicons name={iconName as any} size={12} color={color} />
      <Text style={[styles.genderTagText, { color }]}>{gender}</Text>
    </View>
  );
}

// ─── Property Card Content ────────────────────────────────────────────────────
function PropertyCardContent({ property }: { property: Property }) {
  return (
    <View style={styles.cardInner}>
      <Image source={{ uri: property.imageUrls[0] }} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gradient} />
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoRow}>
          <Text style={styles.apartmentName} numberOfLines={1}>{property.apartmentName}</Text>
          <GenderTag gender={property.preferredGender} />
        </View>
        <Text style={styles.address} numberOfLines={1}>
          📍 {property.address}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>${property.originalRentPrice}/mo</Text>
          <Text style={styles.subletPrice}>${property.subletPrice}/mo</Text>
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>SAVE ${property.originalRentPrice - property.subletPrice}</Text>
          </View>
        </View>
        <Text style={styles.utilityText}>+${property.avgUtilityFee} avg utilities</Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            📅 {formatDate(property.availableStartDate)} – {formatDate(property.availableEndDate)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Seeker Card Content ──────────────────────────────────────────────────────
function SeekerCardContent({ card }: { card: SeekerCard }) {
  const { user, profile } = card;
  const fallback = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80';
  return (
    <View style={styles.cardInner}>
      <Image source={{ uri: user.profileImageUrl ?? fallback }} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.gradient} />
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoRow}>
          <Text style={styles.apartmentName} numberOfLines={1}>{user.name}</Text>
          <GenderTag gender={profile.preferredGender} />
        </View>
        {user.bio ? <Text style={styles.address} numberOfLines={2}>{user.bio}</Text> : null}
        <View style={styles.priceRow}>
          <Text style={styles.subletPrice}> ${profile.targetPriceMin} – ${profile.targetPriceMax}</Text>
          <Text style={styles.utilityText}> /mo</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            📅 {formatDate(profile.desiredStartDate)} – {formatDate(profile.desiredEndDate)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
interface SwipeCardProps {
  index: number;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  children: React.ReactNode;
}

function SwipeCard({ index, onSwipedLeft, onSwipedRight, children }: SwipeCardProps) {
  const isTop = index === 0;
  const isTopRef = useRef(isTop);
  isTopRef.current = isTop;

  const position    = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopRef.current,
      onMoveShouldSetPanResponder:  () => isTopRef.current,
      onPanResponderMove: (_, g) => {
        position.setValue({ x: g.dx, y: g.dy });
        const ratio = Math.abs(g.dx) / SWIPE_THRESHOLD;
        if (g.dx > 0) {
          likeOpacity.setValue(Math.min(ratio, 1));
          nopeOpacity.setValue(0);
        } else {
          nopeOpacity.setValue(Math.min(ratio, 1));
          likeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: g.dy + 50 },
            duration: 320,
            useNativeDriver: true,
          }).start(() => onSwipedRight());
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: g.dy + 50 },
            duration: 320,
            useNativeDriver: true,
          }).start(() => onSwipedLeft());
        } else {
          Animated.parallel([
            Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
            Animated.timing(likeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(nopeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  // Back cards: static scale + offset (no gesture)
  if (!isTop) {
    const scale   = Math.max(1 - index * 0.04, 0.88);
    const offsetY = index * 8;
    return (
      <View style={[styles.card, { transform: [{ translateY: offsetY }, { scale }] }]}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
      {...panResponder.panHandlers}
    >
      {children}
      {/* LIKE stamp */}
      <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
        <Text style={[styles.stampText, { color: COLORS.success }]}>LIKE</Text>
      </Animated.View>
      {/* NOPE stamp */}
      <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
        <Text style={[styles.stampText, { color: COLORS.danger }]}>NOPE</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ mode, onToggle }: { mode: AppMode; onToggle: (m: AppMode) => void }) {
  const seekerActive = mode === 'seeker';
  return (
    <View style={styles.header}>
      <Text style={styles.logoText}>SubMatch</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, seekerActive && styles.toggleBtnActive]}
          onPress={() => onToggle('seeker')} activeOpacity={0.8}
        >
          <Ionicons name="search" size={14} color={seekerActive ? COLORS.white : COLORS.muted} />
          <Text style={[styles.toggleLabel, seekerActive && styles.toggleLabelActive]}>Find Room</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !seekerActive && styles.toggleBtnActive]}
          onPress={() => onToggle('host')} activeOpacity={0.8}
        >
          <Ionicons name="home" size={14} color={!seekerActive ? COLORS.white : COLORS.muted} />
          <Text style={[styles.toggleLabel, !seekerActive && styles.toggleLabelActive]}>List Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ mode }: { mode: AppMode }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={mode === 'seeker' ? 'home-outline' : 'people-outline'} size={72} color="#CCC" />
      <Text style={styles.emptyTitle}>You've seen them all!</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for more {mode === 'seeker' ? 'listings' : 'seekers'}.
      </Text>
    </View>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────
function ActionButtons({ onNope, onLike }: { onNope: () => void; onLike: () => void }) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.actionBtn, styles.actionNope]} onPress={onNope} activeOpacity={0.85}>
        <Ionicons name="close" size={30} color={COLORS.danger} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.actionLike]} onPress={onLike} activeOpacity={0.85}>
        <Ionicons name="heart" size={28} color={COLORS.success} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<AppMode>('seeker');
  const [properties, setProperties] = useState<Property[]>([...MOCK_PROPERTIES]);
  const [seekers, setSeekers]       = useState<SeekerCard[]>([...MOCK_SEEKER_CARDS]);

  const currentDeck = mode === 'seeker' ? properties : seekers;

  const removeTop = useCallback(() => {
    if (mode === 'seeker') setProperties(p => p.slice(1));
    else setSeekers(s => s.slice(1));
  }, [mode]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setProperties([...MOCK_PROPERTIES]);
    setSeekers([...MOCK_SEEKER_CARDS]);
  };

  const visibleCards = currentDeck.slice(0, 4);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <Header mode={mode} onToggle={handleModeChange} />

        <View style={styles.deckContainer}>
          {currentDeck.length === 0 ? (
            <EmptyState mode={mode} />
          ) : (
            [...visibleCards].reverse().map((item, reversedIndex) => {
              const index = visibleCards.length - 1 - reversedIndex;
              const key = mode === 'seeker'
                ? (item as Property).id
                : (item as SeekerCard).user.id;
              return (
                <SwipeCard
                  key={key}
                  index={index}
                  onSwipedLeft={removeTop}
                  onSwipedRight={removeTop}
                >
                  {mode === 'seeker'
                    ? <PropertyCardContent property={item as Property} />
                    : <SeekerCardContent card={item as SeekerCard} />}
                </SwipeCard>
              );
            })
          )}
        </View>

        {currentDeck.length > 0 && (
          <ActionButtons onNope={removeTop} onLike={removeTop} />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentDeck.length} {mode === 'seeker' ? 'listings' : 'seekers'} left
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 32 : 52,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderRadius: 24,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 21,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  toggleLabelActive: {
    color: COLORS.white,
  },

  // Deck
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  cardInner: { flex: 1 },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CARD_HEIGHT * 0.55,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 5,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  apartmentName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  address: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  subletPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4ADE80',
  },
  saveBadge: {
    backgroundColor: 'rgba(74,222,128,0.25)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.6)',
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
    letterSpacing: 0.3,
  },
  utilityText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },

  // Gender tag
  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  genderTagText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Stamps
  stamp: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 3,
  },
  stampLike: {
    left: 24,
    borderColor: COLORS.success,
    backgroundColor: 'rgba(0,200,83,0.1)',
    transform: [{ rotate: '-20deg' }],
  },
  stampNope: {
    right: 24,
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255,23,68,0.1)',
    transform: [{ rotate: '20deg' }],
  },
  stampText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    paddingVertical: 16,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  actionNope: {
    borderWidth: 2,
    borderColor: 'rgba(255,23,68,0.3)',
  },
  actionLike: {
    borderWidth: 2,
    borderColor: 'rgba(0,200,83,0.3)',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#444',
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

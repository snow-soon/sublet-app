import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
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
  Modal,
  ScrollView,
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

import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import SeekerAuthScreen from './src/screens/SeekerAuthScreen';
import OwnerAuthScreen from './src/screens/OwnerAuthScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 24;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// ─── Auth types ──────────────────────────────────────────────────────────────
type UserRole = 'seeker' | 'owner';
type AuthScreen = 'role-select' | 'seeker-auth' | 'owner-auth' | 'dashboard';

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

// ─── Colour tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#FF5A5F',
  success: '#00C853',
  danger: '#FF1744',
  bg: '#F7F7F7',
  card: '#FFFFFF',
  muted: '#888888',
  white: '#FFFFFF',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const [, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// ─── Image Carousel (Tinder-style) ───────────────────────────────────────────
function ImageCarousel({ imageUrls }: { imageUrls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = imageUrls.length;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri: imageUrls[currentIndex] }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      {/* Progress bars at top (Tinder-style) */}
      {total > 1 && (
        <View style={styles.progressBarContainer} pointerEvents="none">
          {imageUrls.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressBar,
                { flex: 1, backgroundColor: i === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' },
              ]}
            />
          ))}
        </View>
      )}
      {/* Tap zones covering entire left/right edges */}
      {total > 1 && (
        <>
          <TouchableOpacity
            style={styles.tapZoneLeft}
            activeOpacity={1}
            onPress={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))}
          />
          <TouchableOpacity
            style={styles.tapZoneRight}
            activeOpacity={1}
            onPress={() => setCurrentIndex(prev => (prev < total - 1 ? prev + 1 : prev))}
          />
        </>
      )}
    </View>
  );
}

// ─── Gender Tag ───────────────────────────────────────────────────────────────
function GenderTag({ gender }: { gender: string }) {
  const iconName =
    gender === 'Female' ? 'female' :
      gender === 'Male' ? 'male' : 'transgender';
  const color =
    gender === 'Female' ? '#E91E8C' :
      gender === 'Male' ? '#1565C0' : '#7B1FA2';
  return (
    <View style={[styles.genderTag, { borderColor: color }]}>
      <Ionicons name={iconName as any} size={12} color={color} />
      <Text style={[styles.genderTagText, { color }]}>{gender}</Text>
    </View>
  );
}

// ─── Property Card Content ────────────────────────────────────────────────────
function PropertyCardContent({ property, onShowDetail }: { property: Property; onShowDetail?: () => void }) {
  return (
    <View style={styles.cardInner}>
      <ImageCarousel imageUrls={property.imageUrls} />
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
      {/* Detail expand button */}
      {onShowDetail && (
        <TouchableOpacity style={styles.detailBtn} onPress={onShowDetail} activeOpacity={0.8}>
          <Ionicons name="chevron-up" size={18} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Seeker Card Content ──────────────────────────────────────────────────────
function SeekerCardContent({ card, onShowDetail }: { card: SeekerCard; onShowDetail?: () => void }) {
  const { user, profile } = card;
  return (
    <View style={styles.cardInner}>
      <ImageCarousel imageUrls={user.imageUrls} />
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
      {/* Detail expand button */}
      {onShowDetail && (
        <TouchableOpacity style={styles.detailBtn} onPress={onShowDetail} activeOpacity={0.8}>
          <Ionicons name="chevron-up" size={18} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Swipe-Down Detail Modal ─────────────────────────────────────────────────
const MODAL_DISMISS_THRESHOLD = 120;

// ─── Property Detail Modal ───────────────────────────────────────────────────
function PropertyDetailModal({ property, visible, onClose }: { property: Property | null; visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const closingRef = useRef(false);

  const combinedTranslateY = useRef(Animated.add(slideAnim, dragY)).current;

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      slideAnim.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      overlayOpacity.setValue(0);
      closingRef.current = false;
      onClose();
    });
  }, [onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          dragY.setValue(g.dy);
          const progress = Math.max(0, 1 - g.dy / (SCREEN_HEIGHT * 0.5));
          overlayOpacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > MODAL_DISMISS_THRESHOLD) {
          dismiss();
        } else {
          Animated.parallel([
            Animated.timing(dragY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      dragY.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
    }
  }, [visible]);

  const onModalShow = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!property) return null;

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={dismiss} onShow={onModalShow}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={styles.modalOverlayTouch} onPress={dismiss} activeOpacity={1} />
        </Animated.View>
        <Animated.View style={[styles.modalSheet, styles.modalSheetAbsolute, { transform: [{ translateY: combinedTranslateY }] }]}>
          {/* Swipe handle */}
          <View {...panResponder.panHandlers} style={styles.modalHandle}>
            <View style={styles.modalHandleBar} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {/* Header image */}
            <Image source={{ uri: property.imageUrls[0] }} style={styles.modalImage} resizeMode="cover" />

            {/* Title */}
            <Text style={styles.modalTitle}>{property.apartmentName}</Text>
            <Text style={styles.modalAddress}>📍 {property.address}</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>{property.description}</Text>

            {/* Info grid */}
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Ionicons name="cash-outline" size={20} color="#4ADE80" />
                <Text style={styles.modalInfoLabel}>Price</Text>
                <Text style={styles.modalInfoValue}>${property.subletPrice}/mo</Text>
                <Text style={styles.modalInfoSub}>was ${property.originalRentPrice}/mo</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="calendar-outline" size={20} color="#6C5CE7" />
                <Text style={styles.modalInfoLabel}>Dates</Text>
                <Text style={styles.modalInfoValue}>{formatDate(property.availableStartDate)}</Text>
                <Text style={styles.modalInfoSub}>to {formatDate(property.availableEndDate)}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="bed-outline" size={20} color="#FF5A5F" />
                <Text style={styles.modalInfoLabel}>Room Type</Text>
                <Text style={styles.modalInfoValue}>{property.roomType}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="cube-outline" size={20} color="#00B894" />
                <Text style={styles.modalInfoLabel}>Furnished</Text>
                <Text style={styles.modalInfoValue}>{property.furnished ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="flash-outline" size={20} color="#FDCB6E" />
                <Text style={styles.modalInfoLabel}>Utilities</Text>
                <Text style={styles.modalInfoValue}>+${property.avgUtilityFee}/mo</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="people-outline" size={20} color="#E91E8C" />
                <Text style={styles.modalInfoLabel}>Gender Pref</Text>
                <Text style={styles.modalInfoValue}>{property.preferredGender}</Text>
              </View>
            </View>

            {/* Rules */}
            <Text style={styles.modalSectionTitle}>House Rules</Text>
            <View style={styles.modalRulesList}>
              {property.rules.map((rule, i) => (
                <View key={i} style={styles.modalRuleItem}>
                  <View style={styles.modalRuleDot} />
                  <Text style={styles.modalRuleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Seeker Detail Modal ─────────────────────────────────────────────────────
function SeekerDetailModal({ card, visible, onClose }: { card: SeekerCard | null; visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const closingRef = useRef(false);

  const combinedTranslateY = useRef(Animated.add(slideAnim, dragY)).current;

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      slideAnim.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      overlayOpacity.setValue(0);
      closingRef.current = false;
      onClose();
    });
  }, [onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          dragY.setValue(g.dy);
          const progress = Math.max(0, 1 - g.dy / (SCREEN_HEIGHT * 0.5));
          overlayOpacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > MODAL_DISMISS_THRESHOLD) {
          dismiss();
        } else {
          Animated.parallel([
            Animated.timing(dragY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      dragY.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
    }
  }, [visible]);

  const onModalShow = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!card) return null;

  const { user, profile } = card;

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={dismiss} onShow={onModalShow}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={styles.modalOverlayTouch} onPress={dismiss} activeOpacity={1} />
        </Animated.View>
        <Animated.View style={[styles.modalSheet, styles.modalSheetAbsolute, { transform: [{ translateY: combinedTranslateY }] }]}>
          {/* Swipe handle */}
          <View {...panResponder.panHandlers} style={styles.modalHandle}>
            <View style={styles.modalHandleBar} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {/* Header image */}
            <Image source={{ uri: user.imageUrls[0] }} style={styles.modalImage} resizeMode="cover" />

            {/* Title */}
            <Text style={styles.modalTitle}>{user.name}</Text>
            {user.bio ? <Text style={styles.modalAddress}>{user.bio}</Text> : null}

            {/* About me */}
            {profile.aboutMe ? <Text style={styles.modalDescription}>{profile.aboutMe}</Text> : null}

            {/* Info grid */}
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Ionicons name="cash-outline" size={20} color="#4ADE80" />
                <Text style={styles.modalInfoLabel}>Budget</Text>
                <Text style={styles.modalInfoValue}>${profile.targetPriceMin}</Text>
                <Text style={styles.modalInfoSub}>to ${profile.targetPriceMax}/mo</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="calendar-outline" size={20} color="#6C5CE7" />
                <Text style={styles.modalInfoLabel}>Dates</Text>
                <Text style={styles.modalInfoValue}>{formatDate(profile.desiredStartDate)}</Text>
                <Text style={styles.modalInfoSub}>to {formatDate(profile.desiredEndDate)}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="people-outline" size={20} color="#E91E8C" />
                <Text style={styles.modalInfoLabel}>Gender Pref</Text>
                <Text style={styles.modalInfoValue}>{profile.preferredGender}</Text>
              </View>
            </View>

            {/* Lifestyle */}
            {profile.lifestyle && profile.lifestyle.length > 0 && (
              <>
                <Text style={styles.modalSectionTitle}>Lifestyle</Text>
                <View style={styles.lifestyleTagsContainer}>
                  {profile.lifestyle.map((tag, i) => (
                    <View key={i} style={styles.lifestyleTag}>
                      <Text style={styles.lifestyleTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
interface SwipeCardProps {
  index: number;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  children: React.ReactNode;
}

export interface SwipeCardRef {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({ index, onSwipedLeft, onSwipedRight, children }, ref) => {
  const isTop = index === 0;
  const isTopRef = useRef(isTop);
  isTopRef.current = isTop;

  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction: 'left' | 'right') => {
      const xTarget = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      const stampOpacity = direction === 'right' ? likeOpacity : nopeOpacity;
      Animated.parallel([
        Animated.timing(stampOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(position, {
          toValue: { x: xTarget, y: 50 },
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (direction === 'right') onSwipedRight();
        else onSwipedLeft();
      });
    },
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => isTopRef.current && Math.abs(g.dx) > 8,
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
    const scale = Math.max(1 - index * 0.04, 0.88);
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
      <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]} pointerEvents="none">
        <Text style={[styles.stampText, { color: COLORS.success }]}>LIKE</Text>
      </Animated.View>
      {/* NOPE stamp */}
      <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]} pointerEvents="none">
        <Text style={[styles.stampText, { color: COLORS.danger }]}>NOPE</Text>
      </Animated.View>
    </Animated.View>
  );
});

// ─── Dashboard Header (with logout) ──────────────────────────────────────────
function DashboardHeader({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const isSeeker = user.role === 'seeker';
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logoText}>Roomie</Text>
        <View style={[styles.roleBadge, { backgroundColor: isSeeker ? '#6C5CE7' : '#00B894' }]}>
          <Ionicons name={isSeeker ? 'search' : 'home'} size={10} color="#FFF" />
          <Text style={styles.roleBadgeText}>{isSeeker ? 'Seeker' : 'Owner'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.muted} />
      </TouchableOpacity>
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
  // Auth state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('role-select');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Dashboard state
  const [properties, setProperties] = useState<Property[]>([...MOCK_PROPERTIES]);
  const [seekers, setSeekers] = useState<SeekerCard[]>([...MOCK_SEEKER_CARDS]);

  // Detail modal state
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [detailPropertyVisible, setDetailPropertyVisible] = useState(false);
  const [detailSeeker, setDetailSeeker] = useState<SeekerCard | null>(null);
  const [detailSeekerVisible, setDetailSeekerVisible] = useState(false);

  // Ref for imperative swipe from action buttons
  const topCardRef = useRef<SwipeCardRef>(null);

  const showPropertyDetail = (property: Property) => {
    setDetailProperty(property);
    setDetailPropertyVisible(true);
  };

  const hidePropertyDetail = () => {
    setDetailPropertyVisible(false);
  };

  const showSeekerDetail = (card: SeekerCard) => {
    setDetailSeeker(card);
    setDetailSeekerVisible(true);
  };

  const hideSeekerDetail = () => {
    setDetailSeekerVisible(false);
  };

  // ─── Auth handlers ───────────────────────────────────────────────────────
  const handleSelectRole = (role: 'seeker' | 'owner') => {
    setAuthScreen(role === 'seeker' ? 'seeker-auth' : 'owner-auth');
  };

  const handleLogin = (role: UserRole) => (name: string, email: string) => {
    setCurrentUser({ name, email, role });
    setAuthScreen('dashboard');
    // Reset decks
    setProperties([...MOCK_PROPERTIES]);
    setSeekers([...MOCK_SEEKER_CARDS]);
  };

  const handleBackToRoleSelect = () => {
    setAuthScreen('role-select');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthScreen('role-select');
  };

  // ─── Auth screens ────────────────────────────────────────────────────────
  if (authScreen === 'role-select') {
    return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
  }

  if (authScreen === 'seeker-auth') {
    return (
      <SeekerAuthScreen
        onLogin={handleLogin('seeker')}
        onBack={handleBackToRoleSelect}
      />
    );
  }

  if (authScreen === 'owner-auth') {
    return (
      <OwnerAuthScreen
        onLogin={handleLogin('owner')}
        onBack={handleBackToRoleSelect}
      />
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────
  if (!currentUser) return null;

  const mode: AppMode = currentUser.role === 'seeker' ? 'seeker' : 'host';
  const currentDeck = mode === 'seeker' ? properties : seekers;

  const removeTop = () => {
    if (mode === 'seeker') setProperties(p => p.slice(1));
    else setSeekers(s => s.slice(1));
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (topCardRef.current) {
      topCardRef.current.triggerSwipe(direction);
    } else {
      removeTop();
    }
  };

  const visibleCards = currentDeck.slice(0, 4);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <DashboardHeader user={currentUser} onLogout={handleLogout} />

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
                  ref={index === 0 ? topCardRef : undefined}
                  index={index}
                  onSwipedLeft={removeTop}
                  onSwipedRight={removeTop}
                >
                  {mode === 'seeker'
                    ? <PropertyCardContent property={item as Property} onShowDetail={() => showPropertyDetail(item as Property)} />
                    : <SeekerCardContent card={item as SeekerCard} onShowDetail={() => showSeekerDetail(item as SeekerCard)} />}
                </SwipeCard>
              );
            })
          )}
        </View>

        {currentDeck.length > 0 && (
          <ActionButtons onNope={() => handleButtonSwipe('left')} onLike={() => handleButtonSwipe('right')} />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentDeck.length} {mode === 'seeker' ? 'listings' : 'seekers'} left
          </Text>
        </View>
      </View>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={detailProperty}
        visible={detailPropertyVisible}
        onClose={hidePropertyDetail}
      />

      {/* Seeker Detail Modal */}
      <SeekerDetailModal
        card={detailSeeker}
        visible={detailSeekerVisible}
        onClose={hideSeekerDetail}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Progress bars (Tinder-style)
  progressBarContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 20,
  },
  // Tap zones for image navigation (full height)
  tapZoneLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '45%',
    zIndex: 20,
  },
  tapZoneRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '45%',
    zIndex: 20,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
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
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  address: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  subletPrice: {
    fontSize: 26,
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
    fontSize: 12,
    fontWeight: '700',
  },

  // Detail expand button
  detailBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
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
    gap: 40,
    paddingVertical: 12,
  },
  actionBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
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

  // Detail Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalSheetAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D0D0D0',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  modalAddress: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  modalInfoItem: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    backgroundColor: '#F8F8FA',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  modalInfoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  modalInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  modalInfoSub: {
    fontSize: 11,
    color: '#AAA',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  modalRulesList: {
    gap: 8,
  },
  modalRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalRuleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A5F',
  },
  modalRuleText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },

  // Lifestyle tags (seeker detail)
  lifestyleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lifestyleTag: {
    backgroundColor: '#F0EDFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  lifestyleTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C5CE7',
  },
});

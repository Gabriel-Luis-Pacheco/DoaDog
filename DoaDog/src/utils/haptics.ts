import * as Haptics from 'expo-haptics';

export async function impactLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics may be unavailable on simulator/web; keep UX non-blocking.
  }
}

export async function impactMedium() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics may be unavailable on simulator/web; keep UX non-blocking.
  }
}

export async function successHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics may be unavailable on simulator/web; keep UX non-blocking.
  }
}

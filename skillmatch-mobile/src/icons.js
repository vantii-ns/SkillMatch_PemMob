import { Image, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { c } from './theme';

// Official SkillMatch Logos from Figma logo.pdf
export function SkillMatchLogo({ width = 220, height = 186, style }) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={[{ width, height, resizeMode: 'contain' }, style]}
    />
  );
}

export function SkillMatchWordmark({ width = 160, height = 36, style }) {
  return (
    <Image
      source={require('../assets/logo-wordmark.png')}
      style={[{ width, height, resizeMode: 'contain' }, style]}
    />
  );
}

export function SkillMatchEmblem({ size = 48, style }) {
  return (
    <Image
      source={require('../assets/logo-emblem.png')}
      style={[{ width: size, height: size * 1.15, resizeMode: 'contain' }, style]}
    />
  );
}

// Navigation & Tab Icons
export function IconSearch({ size = 20, color = c.primer }) {
  return <Feather name="search" size={size} color={color} />;
}

export function IconUsers({ size = 20, color = c.primer }) {
  return <Feather name="users" size={size} color={color} />;
}

export function IconBox({ size = 20, color = c.primer }) {
  return <Feather name="inbox" size={size} color={color} />;
}

export function IconUser({ size = 20, color = c.primer }) {
  return <Feather name="user" size={size} color={color} />;
}

// Action Icons
export function IconBack({ size = 24, color = c.primer }) {
  return <Feather name="arrow-left" size={size} color={color} />;
}

export function IconArrowRight({ size = 18, color = c.putih }) {
  return <Feather name="arrow-right" size={size} color={color} />;
}

export function IconArrowUpRight({ size = 18, color = c.primer }) {
  return <Feather name="arrow-up-right" size={size} color={color} />;
}

export function IconPlus({ size = 18, color = c.putih }) {
  return <Feather name="plus" size={size} color={color} />;
}

export function IconCheck({ size = 16, color = c.putih }) {
  return <Feather name="check" size={size} color={color} />;
}

export function IconClock({ size = 15, color = c.redup }) {
  return <Feather name="clock" size={size} color={color} />;
}

export function IconClose({ size = 16, color = c.redup }) {
  return <Feather name="x" size={size} color={color} />;
}

export function IconEdit({ size = 16, color = c.primer }) {
  return <Feather name="edit-2" size={size} color={color} />;
}

export function IconTrash({ size = 18, color = c.primer }) {
  return <Feather name="trash-2" size={size} color={color} />;
}

export function IconSend({ size = 18, color = c.putih }) {
  return <Feather name="send" size={size} color={color} />;
}

export function IconFilter({ size = 22, color = c.primer }) {
  return <Ionicons name="options-outline" size={size} color={color} />;
}

export function IconRefresh({ size = 20, color = c.primer }) {
  return <Feather name="refresh-cw" size={size} color={color} />;
}

export function IconChat({ size = 18, color = c.putih }) {
  return <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />;
}

export function IconSchool({ size = 22, color = '#E8D9C8' }) {
  return <Ionicons name="school-outline" size={size} color={color} />;
}

export function IconMail({ size = 18, color = c.redup }) {
  return <Feather name="mail" size={size} color={color} />;
}

export function IconEye({ size = 18, color = c.redup }) {
  return <Feather name="eye" size={size} color={color} />;
}

export function IconEyeOff({ size = 18, color = c.redup }) {
  return <Feather name="eye-off" size={size} color={color} />;
}

export function IconLock({ size = 18, color = c.redup }) {
  return <Feather name="lock" size={size} color={color} />;
}

export function IconExternalLink({ size = 18, color = c.primer }) {
  return <Feather name="external-link" size={size} color={color} />;
}

export function IconGitHub({ size = 20, color = c.teks }) {
  return <Ionicons name="logo-github" size={size} color={color} />;
}

export function IconGitPullRequest({ size = 20, color = c.primer }) {
  return <Feather name="git-pull-request" size={size} color={color} />;
}

export function IconFigma({ size = 20, color = c.teks }) {
  return <Ionicons name="logo-figma" size={size} color={color} />;
}

export function IconLink({ size = 18, color = c.primer }) {
  return <Feather name="link" size={size} color={color} />;
}

export function IconLogOut({ size = 18, color = c.primer }) {
  return <Feather name="log-out" size={size} color={color} />;
}

export function IconUserPlus({ size = 18, color = c.putih }) {
  return <Feather name="user-plus" size={size} color={color} />;
}

export function IconChevronRight({ size = 18, color = c.redup }) {
  return <Feather name="chevron-right" size={size} color={color} />;
}

export function IconInfo({ size = 18, color = c.primer }) {
  return <Feather name="info" size={size} color={color} />;
}

export function IconCheckCircle({ size = 20, color = c.primer }) {
  return <Ionicons name="checkmark-circle" size={size} color={color} />;
}

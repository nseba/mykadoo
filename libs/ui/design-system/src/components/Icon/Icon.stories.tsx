import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import {
  // E-commerce Icons
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Tag,
  Gift,
  Package,
  Truck,
  DollarSign,
  Percent,
  Receipt,
  Wallet,
  Store,
  // User/Social Icons
  User,
  Users,
  UserPlus,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  Share2,
  UserCheck,
  UserMinus,
  UserX,
  HeartHandshake,
  Smile,
  // Navigation Icons
  Home,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronsRight,
  ChevronsLeft,
  Navigation,
  Map,
  // Action Icons
  Plus,
  Minus,
  X,
  Check,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  Upload,
  Copy,
  ExternalLink,
  MoreHorizontal,
  MoreVertical,
  Maximize2,
  Minimize2,
  // Communication Icons
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Send,
  Inbox,
  AtSign,
  Video,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  // Media Icons
  Image,
  Video as VideoIcon,
  Music,
  Camera,
  Film,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  // File Icons
  File,
  FileText,
  Folder,
  FolderOpen,
  FileImage,
  FileVideo,
  FileAudio,
  FolderPlus,
  // Time Icons
  Calendar,
  Clock,
  Timer,
  CalendarDays,
  CalendarCheck,
  Hourglass,
  // Settings Icons
  Settings,
  Tool,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  // Status Icons
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Loader,
  Zap,
  // Additional Gift-Finding Icons
  Sparkles,
  TrendingUp,
  Award,
  Target,
  BookmarkPlus,
  List,
  Grid,
  LayoutGrid,
  SlidersHorizontal,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Lucide React icon component',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Icon size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    color: {
      control: 'select',
      options: ['current', 'primary', 'secondary', 'success', 'warning', 'error', 'neutral'],
      description: 'Icon color variant',
      table: {
        defaultValue: { summary: 'current' },
      },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.25 },
      description: 'Stroke width of the icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// ============================================================================
// BASIC STORIES
// ============================================================================

export const Default: Story = {
  args: {
    icon: Heart,
    size: 'md',
    color: 'current',
  },
};

export const ExtraSmall: Story = {
  args: {
    icon: Heart,
    size: 'xs',
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra small icon (12px) - ideal for inline text or compact UI.',
      },
    },
  },
};

export const Small: Story = {
  args: {
    icon: Heart,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small icon (16px) - perfect for buttons and form inputs.',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    icon: Heart,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium icon (20px) - default size, balanced for most use cases.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    icon: Heart,
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large icon (24px) - great for prominent actions and section headers.',
      },
    },
  },
};

export const ExtraLarge: Story = {
  args: {
    icon: Heart,
    size: 'xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra large icon (32px) - ideal for empty states and feature highlights.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="xs" color="primary" />
        <span className="text-xs text-neutral-600">xs (12px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="sm" color="primary" />
        <span className="text-xs text-neutral-600">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="md" color="primary" />
        <span className="text-xs text-neutral-600">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="primary" />
        <span className="text-xs text-neutral-600">lg (24px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="xl" color="primary" />
        <span className="text-xs text-neutral-600">xl (32px)</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available icon sizes side by side.',
      },
    },
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="current" />
        <span className="text-xs text-neutral-600">current</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="primary" />
        <span className="text-xs text-neutral-600">primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="secondary" />
        <span className="text-xs text-neutral-600">secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="success" />
        <span className="text-xs text-neutral-600">success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="warning" />
        <span className="text-xs text-neutral-600">warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="error" />
        <span className="text-xs text-neutral-600">error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" color="neutral" />
        <span className="text-xs text-neutral-600">neutral</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available color variants.',
      },
    },
  },
};

export const CustomStrokeWidth: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={0.5} />
        <span className="text-xs text-neutral-600">0.5</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={1} />
        <span className="text-xs text-neutral-600">1.0</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={1.5} />
        <span className="text-xs text-neutral-600">1.5</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={2} />
        <span className="text-xs text-neutral-600">2.0 (default)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={2.5} />
        <span className="text-xs text-neutral-600">2.5</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Heart} size="lg" strokeWidth={3} />
        <span className="text-xs text-neutral-600">3.0</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons with different stroke widths. Default is 2.0.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - E-COMMERCE
// ============================================================================

const ecommerceIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: ShoppingCart, name: 'ShoppingCart' },
  { icon: ShoppingBag, name: 'ShoppingBag' },
  { icon: CreditCard, name: 'CreditCard' },
  { icon: Tag, name: 'Tag' },
  { icon: Gift, name: 'Gift' },
  { icon: Package, name: 'Package' },
  { icon: Truck, name: 'Truck' },
  { icon: DollarSign, name: 'DollarSign' },
  { icon: Percent, name: 'Percent' },
  { icon: Receipt, name: 'Receipt' },
  { icon: Wallet, name: 'Wallet' },
  { icon: Store, name: 'Store' },
];

export const EcommerceIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {ecommerceIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="primary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'E-commerce and shopping-related icons for Mykadoo gift search features.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - USER/SOCIAL
// ============================================================================

const userSocialIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: User, name: 'User' },
  { icon: Users, name: 'Users' },
  { icon: UserPlus, name: 'UserPlus' },
  { icon: UserCheck, name: 'UserCheck' },
  { icon: UserMinus, name: 'UserMinus' },
  { icon: UserX, name: 'UserX' },
  { icon: Heart, name: 'Heart' },
  { icon: Star, name: 'Star' },
  { icon: ThumbsUp, name: 'ThumbsUp' },
  { icon: MessageCircle, name: 'MessageCircle' },
  { icon: Share2, name: 'Share2' },
  { icon: HeartHandshake, name: 'HeartHandshake' },
  { icon: Smile, name: 'Smile' },
];

export const UserSocialIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {userSocialIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="secondary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile and social interaction icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - NAVIGATION
// ============================================================================

const navigationIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Home, name: 'Home' },
  { icon: Menu, name: 'Menu' },
  { icon: ChevronRight, name: 'ChevronRight' },
  { icon: ChevronLeft, name: 'ChevronLeft' },
  { icon: ChevronUp, name: 'ChevronUp' },
  { icon: ChevronDown, name: 'ChevronDown' },
  { icon: ChevronsRight, name: 'ChevronsRight' },
  { icon: ChevronsLeft, name: 'ChevronsLeft' },
  { icon: ArrowRight, name: 'ArrowRight' },
  { icon: ArrowLeft, name: 'ArrowLeft' },
  { icon: ArrowUp, name: 'ArrowUp' },
  { icon: ArrowDown, name: 'ArrowDown' },
  { icon: Navigation, name: 'Navigation' },
  { icon: Map, name: 'Map' },
];

export const NavigationIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {navigationIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation and directional icons for menus, breadcrumbs, and pagination.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - ACTIONS
// ============================================================================

const actionIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Plus, name: 'Plus' },
  { icon: Minus, name: 'Minus' },
  { icon: X, name: 'X' },
  { icon: Check, name: 'Check' },
  { icon: Search, name: 'Search' },
  { icon: Filter, name: 'Filter' },
  { icon: Edit, name: 'Edit' },
  { icon: Trash2, name: 'Trash2' },
  { icon: Download, name: 'Download' },
  { icon: Upload, name: 'Upload' },
  { icon: Copy, name: 'Copy' },
  { icon: ExternalLink, name: 'ExternalLink' },
  { icon: MoreHorizontal, name: 'MoreHorizontal' },
  { icon: MoreVertical, name: 'MoreVertical' },
  { icon: Maximize2, name: 'Maximize2' },
  { icon: Minimize2, name: 'Minimize2' },
];

export const ActionIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {actionIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="neutral" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common action icons for buttons and interactive elements.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - COMMUNICATION
// ============================================================================

const communicationIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Mail, name: 'Mail' },
  { icon: Phone, name: 'Phone' },
  { icon: MessageSquare, name: 'MessageSquare' },
  { icon: Bell, name: 'Bell' },
  { icon: Send, name: 'Send' },
  { icon: Inbox, name: 'Inbox' },
  { icon: AtSign, name: 'AtSign' },
  { icon: Video, name: 'Video' },
  { icon: Mic, name: 'Mic' },
  { icon: MicOff, name: 'MicOff' },
  { icon: PhoneCall, name: 'PhoneCall' },
  { icon: PhoneOff, name: 'PhoneOff' },
];

export const CommunicationIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {communicationIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="primary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Communication and messaging icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - MEDIA
// ============================================================================

const mediaIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Image, name: 'Image' },
  { icon: VideoIcon, name: 'Video' },
  { icon: Music, name: 'Music' },
  { icon: Camera, name: 'Camera' },
  { icon: Film, name: 'Film' },
  { icon: PlayCircle, name: 'PlayCircle' },
  { icon: PauseCircle, name: 'PauseCircle' },
  { icon: Volume2, name: 'Volume2' },
  { icon: VolumeX, name: 'VolumeX' },
];

export const MediaIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {mediaIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="secondary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Media and playback control icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - FILES
// ============================================================================

const fileIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: File, name: 'File' },
  { icon: FileText, name: 'FileText' },
  { icon: Folder, name: 'Folder' },
  { icon: FolderOpen, name: 'FolderOpen' },
  { icon: FileImage, name: 'FileImage' },
  { icon: FileVideo, name: 'FileVideo' },
  { icon: FileAudio, name: 'FileAudio' },
  { icon: FolderPlus, name: 'FolderPlus' },
];

export const FileIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {fileIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="neutral" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'File and folder management icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - TIME
// ============================================================================

const timeIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Calendar, name: 'Calendar' },
  { icon: Clock, name: 'Clock' },
  { icon: Timer, name: 'Timer' },
  { icon: CalendarDays, name: 'CalendarDays' },
  { icon: CalendarCheck, name: 'CalendarCheck' },
  { icon: Hourglass, name: 'Hourglass' },
];

export const TimeIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {timeIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="primary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Time and calendar-related icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - SETTINGS
// ============================================================================

const settingsIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Settings, name: 'Settings' },
  { icon: Tool, name: 'Tool' },
  { icon: Sliders, name: 'Sliders' },
  { icon: SlidersHorizontal, name: 'SlidersHorizontal' },
  { icon: ToggleLeft, name: 'ToggleLeft' },
  { icon: ToggleRight, name: 'ToggleRight' },
  { icon: Lock, name: 'Lock' },
  { icon: Unlock, name: 'Unlock' },
  { icon: Eye, name: 'Eye' },
  { icon: EyeOff, name: 'EyeOff' },
];

export const SettingsIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {settingsIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="neutral" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Settings and configuration icons.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - STATUS
// ============================================================================

const statusIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: AlertCircle, name: 'AlertCircle' },
  { icon: Info, name: 'Info' },
  { icon: CheckCircle, name: 'CheckCircle' },
  { icon: XCircle, name: 'XCircle' },
  { icon: AlertTriangle, name: 'AlertTriangle' },
  { icon: HelpCircle, name: 'HelpCircle' },
  { icon: Loader, name: 'Loader' },
  { icon: Zap, name: 'Zap' },
];

export const StatusIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {statusIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon
            icon={icon}
            size="lg"
            color={
              name === 'CheckCircle'
                ? 'success'
                : name === 'AlertTriangle'
                  ? 'warning'
                  : name === 'XCircle' || name === 'AlertCircle'
                    ? 'error'
                    : 'primary'
            }
          />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status and notification icons with semantic colors.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - GIFT FINDING (MYKADOO SPECIFIC)
// ============================================================================

const giftFindingIcons: Array<{ icon: LucideIcon; name: string }> = [
  { icon: Gift, name: 'Gift' },
  { icon: Sparkles, name: 'Sparkles' },
  { icon: Heart, name: 'Heart' },
  { icon: Star, name: 'Star' },
  { icon: TrendingUp, name: 'TrendingUp' },
  { icon: Award, name: 'Award' },
  { icon: Target, name: 'Target' },
  { icon: BookmarkPlus, name: 'BookmarkPlus' },
  { icon: List, name: 'List' },
  { icon: Grid, name: 'Grid' },
  { icon: LayoutGrid, name: 'LayoutGrid' },
  { icon: RefreshCw, name: 'RefreshCw' },
];

export const GiftFindingIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-6">
      {giftFindingIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon icon={icon} size="lg" color="primary" />
          <span className="text-xs text-center text-neutral-600">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons specifically useful for Mykadoo gift-finding features.',
      },
    },
  },
};

// ============================================================================
// ICON SHOWCASE - ALL CATEGORIES GRID
// ============================================================================

export const AllIconsGrid: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">E-commerce</h3>
        <div className="grid grid-cols-8 gap-6">
          {ecommerceIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" color="primary" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">User & Social</h3>
        <div className="grid grid-cols-8 gap-6">
          {userSocialIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" color="secondary" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Navigation</h3>
        <div className="grid grid-cols-8 gap-6">
          {navigationIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Actions</h3>
        <div className="grid grid-cols-8 gap-6">
          {actionIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" color="neutral" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Communication</h3>
        <div className="grid grid-cols-8 gap-6">
          {communicationIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" color="primary" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Status</h3>
        <div className="grid grid-cols-8 gap-6">
          {statusIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon
                icon={icon}
                size="lg"
                color={
                  name === 'CheckCircle'
                    ? 'success'
                    : name === 'AlertTriangle'
                      ? 'warning'
                      : name === 'XCircle' || name === 'AlertCircle'
                        ? 'error'
                        : 'primary'
                }
              />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Gift Finding</h3>
        <div className="grid grid-cols-8 gap-6">
          {giftFindingIcons.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon icon={icon} size="lg" color="primary" />
              <span className="text-xs text-center text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all icon categories available in the design system.',
      },
    },
  },
};

// ============================================================================
// REAL-WORLD USAGE EXAMPLES
// ============================================================================

export const ButtonWithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        <Icon icon={ShoppingCart} size="sm" color="current" />
        Add to Cart
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
        <Icon icon={Heart} size="sm" color="current" />
        Save to Wishlist
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
        <Icon icon={Share2} size="sm" />
        Share Gift
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors">
        Buy Now
        <Icon icon={ArrowRight} size="sm" color="current" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons paired with button labels for clear action context.',
      },
    },
  },
};

export const IconButton: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Search"
      >
        <Icon icon={Search} size="md" color="neutral" />
      </button>
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Favorites"
      >
        <Icon icon={Heart} size="md" color="error" />
      </button>
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Settings"
      >
        <Icon icon={Settings} size="md" color="neutral" />
      </button>
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Notifications"
      >
        <Icon icon={Bell} size="md" color="neutral" />
      </button>
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Profile"
      >
        <Icon icon={User} size="md" color="neutral" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons for compact interfaces. Always include aria-label for accessibility.',
      },
    },
  },
};

export const InputWithIcon: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon icon={Search} size="sm" color="neutral" />
        </div>
        <input
          type="text"
          placeholder="Search for gifts..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon icon={Mail} size="sm" color="neutral" />
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon icon={DollarSign} size="sm" color="neutral" />
        </div>
        <input
          type="number"
          placeholder="Budget"
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input fields with leading icons to indicate the field type or purpose.',
      },
    },
  },
};

export const NavigationMenu: Story = {
  render: () => (
    <nav className="bg-white border border-neutral-200 rounded-lg p-2 w-64">
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={Home} size="sm" />
        <span>Home</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={Search} size="sm" />
        <span>Search Gifts</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={Heart} size="sm" />
        <span>Wishlist</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={ShoppingCart} size="sm" />
        <span>Cart</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={User} size="sm" />
        <span>Profile</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Icon icon={Settings} size="sm" />
        <span>Settings</span>
      </a>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation menu with icons for better visual recognition.',
      },
    },
  },
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-start gap-3 p-4 bg-success-50 border border-success-200 rounded-lg">
        <Icon icon={CheckCircle} size="md" color="success" />
        <div>
          <h4 className="font-semibold text-success-900">Order Confirmed</h4>
          <p className="text-sm text-success-700">Your gift will arrive by December 15</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <Icon icon={AlertTriangle} size="md" color="warning" />
        <div>
          <h4 className="font-semibold text-warning-900">Low Stock</h4>
          <p className="text-sm text-warning-700">Only 3 items remaining</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-error-50 border border-error-200 rounded-lg">
        <Icon icon={XCircle} size="md" color="error" />
        <div>
          <h4 className="font-semibold text-error-900">Payment Failed</h4>
          <p className="text-sm text-error-700">Please update your payment method</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <Icon icon={Info} size="md" color="primary" />
        <div>
          <h4 className="font-semibold text-primary-900">Gift Recommendation</h4>
          <p className="text-sm text-primary-700">Based on your search, we found 12 perfect matches</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status messages with semantic colors and icons for different states.',
      },
    },
  },
};

export const ProductCardWithIcons: Story = {
  render: () => (
    <div className="max-w-sm bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="h-48 bg-neutral-100 flex items-center justify-center">
        <Icon icon={Gift} size="xl" color="neutral" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-neutral-900">Premium Gift Box</h3>
          <button className="p-1 hover:bg-neutral-100 rounded">
            <Icon icon={Heart} size="sm" color="error" />
          </button>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <Icon icon={Star} size="xs" color="warning" />
          <Icon icon={Star} size="xs" color="warning" />
          <Icon icon={Star} size="xs" color="warning" />
          <Icon icon={Star} size="xs" color="warning" />
          <Icon icon={Star} size="xs" color="neutral" />
          <span className="text-sm text-neutral-600 ml-1">4.0 (128)</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-neutral-900">$49.99</span>
          <div className="flex items-center gap-1 text-sm text-success-600">
            <Icon icon={Truck} size="xs" color="success" />
            <span>Free shipping</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Icon icon={ShoppingCart} size="sm" color="current" />
            Add to Cart
          </button>
          <button className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
            <Icon icon={Share2} size="sm" color="neutral" />
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Product card showcasing multiple icon use cases: ratings, shipping, wishlist, and actions.',
      },
    },
  },
};

export const BreadcrumbsWithIcons: Story = {
  render: () => (
    <nav className="flex items-center gap-2 text-sm">
      <a href="#" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900">
        <Icon icon={Home} size="xs" />
        Home
      </a>
      <Icon icon={ChevronRight} size="xs" color="neutral" />
      <a href="#" className="text-neutral-600 hover:text-neutral-900">
        Gifts
      </a>
      <Icon icon={ChevronRight} size="xs" color="neutral" />
      <a href="#" className="text-neutral-600 hover:text-neutral-900">
        For Her
      </a>
      <Icon icon={ChevronRight} size="xs" color="neutral" />
      <span className="text-neutral-900 font-medium">Jewelry</span>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb navigation with chevron icons as separators.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Icon icon={Loader} size="md" color="primary" className="animate-spin" />
        <span className="text-neutral-700">Loading recommendations...</span>
      </div>

      <div className="flex items-center gap-3">
        <Icon icon={RefreshCw} size="md" color="secondary" className="animate-spin" />
        <span className="text-neutral-700">Refreshing results...</span>
      </div>

      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg">
        <Icon icon={Loader} size="sm" color="current" className="animate-spin" />
        Processing...
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading indicators using animated icons.',
      },
    },
  },
};

export const EmptyStateWithIcon: Story = {
  render: () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4">
        <Icon icon={ShoppingBag} size="xl" color="neutral" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Your cart is empty</h3>
      <p className="text-neutral-600 mb-6 max-w-sm">
        Start exploring our gift recommendations to find the perfect present!
      </p>
      <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        <Icon icon={Search} size="sm" color="current" />
        Browse Gifts
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state with a large icon to communicate the absence of content.',
      },
    },
  },
};

export const NotificationBadge: Story = {
  render: () => (
    <div className="flex gap-6">
      <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Icon icon={Bell} size="md" color="neutral" />
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-600 text-xs text-white">
          3
        </span>
      </button>

      <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Icon icon={ShoppingCart} size="md" color="neutral" />
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
          5
        </span>
      </button>

      <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Icon icon={Mail} size="md" color="neutral" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error-600" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons with notification badges to show counts or status.',
      },
    },
  },
};

export const FilterControls: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
        <Icon icon={Filter} size="sm" />
        All Filters
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
        <Icon icon={DollarSign} size="sm" />
        Price Range
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
        <Icon icon={Tag} size="sm" />
        Category
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
        <Icon icon={Star} size="sm" />
        Rating
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2 border border-primary-300 bg-primary-50 text-primary-700 rounded-lg">
        <Icon icon={Truck} size="sm" color="primary" />
        Free Shipping
        <Icon icon={X} size="xs" color="primary" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Filter controls with icons for better visual recognition of filter types.',
      },
    },
  },
};

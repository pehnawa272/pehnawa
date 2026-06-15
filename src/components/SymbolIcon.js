import {
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Camera,
  CheckCircle,
  ChevronDown,
  Gem,
  Globe,
  Leaf,
  Lock,
  Mail,
  Menu,
  Package,
  Phone,
  Receipt,
  Ruler,
  Settings2,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";

const WhatsAppIcon = ({ className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M12.004 2c-5.518 0-9.996 4.477-9.996 9.995 0 1.764.459 3.486 1.33 5.005L2 22l5.127-1.345c1.47.8 3.123 1.22 4.803 1.22 5.519 0 9.996-4.477 9.996-9.995C22.004 6.477 17.522 2 12.004 2zm5.728 13.914c-.236.666-1.36 1.21-1.89 1.264-.53.053-1.012.23-3.37-.704-2.836-1.127-4.664-4.01-4.805-4.2-0.14-.19-1.146-1.526-1.146-2.915 0-1.389.728-2.072 1.01-2.358.283-.286.613-.357.824-.357.212 0 .424.004.607.012.193.008.45-.072.703.543.259.626.896 2.186.974 2.345.078.16.13.344.024.553-.106.21-.16.338-.318.524-.158.185-.333.41-.476.55-.16.156-.327.326-.142.645.185.317.82 1.35 1.756 2.186.936.837 1.722 1.096 2.039 1.254.317.16.502.133.69-.08.188-.214.803-.934 1.018-1.25.215-.318.43-.265.728-.155.297.11 1.888.89 2.217 1.055.33.165.55.247.636.397.086.15.086.87-.15 1.536z" />
  </svg>
);

const icons = {
  calendar_month: Calendar,
  check_circle: CheckCircle,
  close: X,
  delete: Trash2,
  diamond: Gem,
  eco: Leaf,
  event: Calendar,
  event_available: CalendarCheck,
  expand_more: ChevronDown,
  inventory_2: Package,
  local_shipping: Truck,
  lock: Lock,
  mail: Mail,
  menu: Menu,
  phone: Phone,
  photo_camera: Camera,
  public: Globe,
  receipt: Receipt,
  shopping_bag: ShoppingBag,
  straighten: Ruler,
  tune: Settings2,
  verified: BadgeCheck,
  whatsapp: WhatsAppIcon,
};

export default function SymbolIcon({ name, className = "" }) {
  const Icon = icons[name] || Package;

  // For custom functional SVG component like WhatsAppIcon, we render it directly
  if (name === "whatsapp") {
    const WhatsApp = icons.whatsapp;
    return <WhatsApp className={className} aria-hidden="true" />;
  }

  return (
    <Icon
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      strokeWidth={1.75}
    />
  );
}

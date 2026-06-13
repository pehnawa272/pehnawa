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
  Receipt,
  Ruler,
  Settings2,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";

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
  photo_camera: Camera,
  public: Globe,
  receipt: Receipt,
  shopping_bag: ShoppingBag,
  straighten: Ruler,
  tune: Settings2,
  verified: BadgeCheck,
};

export default function SymbolIcon({ name, className = "" }) {
  const Icon = icons[name] || Package;

  return (
    <Icon
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      strokeWidth={1.75}
    />
  );
}

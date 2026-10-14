import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle,
  PlayCircle
} from 'lucide-react';

export const STATUS_CONFIG = {
  // Pending / Awaiting
  pending: {
    label: 'Pending',
    variant: 'amber',
    icon: Clock,
    className: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  awaiting_payment: {
    label: 'Awaiting Payment',
    variant: 'amber',
    icon: Clock,
    className: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  open: {
    label: 'Open',
    variant: 'amber',
    icon: Clock,
    className: 'bg-amber-50 text-amber-800 border-amber-200'
  },

  // In Progress / Active / Held
  created: {
    label: 'Created',
    variant: 'blue',
    icon: PlayCircle,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  active: {
    label: 'Active',
    variant: 'blue',
    icon: CheckCircle2,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  in_progress: {
    label: 'In Progress',
    variant: 'blue',
    icon: PlayCircle,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  held: {
    label: 'In Escrow',
    variant: 'blue',
    icon: ShieldCheck,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  funded: {
    label: 'Funded',
    variant: 'blue',
    icon: ShieldCheck,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  submitted: {
    label: 'In Review',
    variant: 'indigo',
    icon: Clock,
    className: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },

  // Completed / Success / Released / Resolved
  completed: {
    label: 'Completed',
    variant: 'emerald',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  released: {
    label: 'Released',
    variant: 'emerald',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  paid: {
    label: 'Paid',
    variant: 'emerald',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  resolved: {
    label: 'Resolved',
    variant: 'emerald',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },

  // Disputed / Under Review
  disputed: {
    label: 'Disputed',
    variant: 'orange',
    icon: AlertTriangle,
    className: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  under_review: {
    label: 'Under Review',
    variant: 'orange',
    icon: AlertTriangle,
    className: 'bg-orange-50 text-orange-800 border-orange-200'
  },

  // Failed / Cancelled / Rejected / Suspended
  cancelled: {
    label: 'Cancelled',
    variant: 'rose',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  rejected: {
    label: 'Rejected',
    variant: 'rose',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  failed: {
    label: 'Failed',
    variant: 'rose',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  suspended: {
    label: 'Suspended',
    variant: 'rose',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-800 border-rose-200'
  },

  // Refunded
  refunded: {
    label: 'Refunded',
    variant: 'slate',
    icon: RotateCcw,
    className: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

export default function StatusBadge({
  status,
  label: customLabel,
  size = 'sm',
  showIcon = true,
  className = ''
}) {
  const normalizedKey = String(status || '').toLowerCase().trim();
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    variant: 'slate',
    icon: HelpCircle,
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const Icon = config.icon;
  const displayLabel = customLabel || config.label;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    xs: 12,
    sm: 13,
    md: 15
  };

  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-full tracking-wide capitalize shadow-xs transition-colors duration-150 ${sizeClasses[size] || sizeClasses.sm} ${config.className} ${className}`}
      role="status"
    >
      {showIcon && Icon && <Icon size={iconSizes[size] || 13} className="shrink-0" aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
}

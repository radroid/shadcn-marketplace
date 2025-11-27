import React from "react";

import AccordionPreview from "@/components/previews/accordion-preview";
import AlertPreview from "@/components/previews/alert-preview";
import AlertDialogPreview from "@/components/previews/alert-dialog-preview";
import AspectRatioPreview from "@/components/previews/aspect-ratio-preview";
import AvatarPreview from "@/components/previews/avatar-preview";
import BadgePreview from "@/components/previews/badge-preview";
import BreadcrumbPreview from "@/components/previews/breadcrumb-preview";
import ButtonPreview from "@/components/previews/button-preview";
import ButtonGroupPreview from "@/components/previews/button-group-preview";
import CalendarPreview from "@/components/previews/calendar-preview";
import CardPreview from "@/components/previews/card-preview";
import CarouselPreview from "@/components/previews/carousel-preview";
import ChartPreview from "@/components/previews/chart-preview";
import CheckboxPreview from "@/components/previews/checkbox-preview";
import CollapsiblePreview from "@/components/previews/collapsible-preview";
import CommandPreview from "@/components/previews/command-preview";
import ContextMenuPreview from "@/components/previews/context-menu-preview";
import DialogPreview from "@/components/previews/dialog-preview";
import DrawerPreview from "@/components/previews/drawer-preview";
import DropdownMenuPreview from "@/components/previews/dropdown-menu-preview";
import EmptyPreview from "@/components/previews/empty-preview";
import FieldPreview from "@/components/previews/field-preview";
import FormPreview from "@/components/previews/form-preview";
import HoverCardPreview from "@/components/previews/hover-card-preview";
import InputPreview from "@/components/previews/input-preview";
import InputGroupPreview from "@/components/previews/input-group-preview";
import InputOtpPreview from "@/components/previews/input-otp-preview";
import ItemPreview from "@/components/previews/item-preview";
import KbdPreview from "@/components/previews/kbd-preview";
import LabelPreview from "@/components/previews/label-preview";
import MenubarPreview from "@/components/previews/menubar-preview";
import NavigationMenuPreview from "@/components/previews/navigation-menu-preview";
import PaginationPreview from "@/components/previews/pagination-preview";
import PopoverPreview from "@/components/previews/popover-preview";
import ProgressPreview from "@/components/previews/progress-preview";
import RadioGroupPreview from "@/components/previews/radio-group-preview";
import ResizablePreview from "@/components/previews/resizable-preview";
import ScrollAreaPreview from "@/components/previews/scroll-area-preview";
import SelectPreview from "@/components/previews/select-preview";
import SeparatorPreview from "@/components/previews/separator-preview";
import SheetPreview from "@/components/previews/sheet-preview";
import SkeletonPreview from "@/components/previews/skeleton-preview";
import SliderPreview from "@/components/previews/slider-preview";
import SonnerPreview from "@/components/previews/sonner-preview";
import SpinnerPreview from "@/components/previews/spinner-preview";
import SwitchPreview from "@/components/previews/switch-preview";
import TablePreview from "@/components/previews/table-preview";
import TabsPreview from "@/components/previews/tabs-preview";
import TextareaPreview from "@/components/previews/textarea-preview";
import TogglePreview from "@/components/previews/toggle-preview";
import ToggleGroupPreview from "@/components/previews/toggle-group-preview";
import TooltipPreview from "@/components/previews/tooltip-preview";

export const REGISTRY: Record<string, React.ComponentType> = {
  "accordion": AccordionPreview,
  "alert": AlertPreview,
  "alert-dialog": AlertDialogPreview,
  "aspect-ratio": AspectRatioPreview,
  "avatar": AvatarPreview,
  "badge": BadgePreview,
  "breadcrumb": BreadcrumbPreview,
  "button": ButtonPreview,
  "button-group": ButtonGroupPreview,
  "calendar": CalendarPreview,
  "card": CardPreview,
  "carousel": CarouselPreview,
  "chart": ChartPreview,
  "checkbox": CheckboxPreview,
  "collapsible": CollapsiblePreview,
  "command": CommandPreview,
  "context-menu": ContextMenuPreview,
  "dialog": DialogPreview,
  "drawer": DrawerPreview,
  "dropdown-menu": DropdownMenuPreview,
  "empty": EmptyPreview,
  "field": FieldPreview,
  "form": FormPreview,
  "hover-card": HoverCardPreview,
  "input": InputPreview,
  "input-group": InputGroupPreview,
  "input-otp": InputOtpPreview,
  "item": ItemPreview,
  "kbd": KbdPreview,
  "label": LabelPreview,
  "menubar": MenubarPreview,
  "navigation-menu": NavigationMenuPreview,
  "pagination": PaginationPreview,
  "popover": PopoverPreview,
  "progress": ProgressPreview,
  "radio-group": RadioGroupPreview,
  "resizable": ResizablePreview,
  "scroll-area": ScrollAreaPreview,
  "select": SelectPreview,
  "separator": SeparatorPreview,
  "sheet": SheetPreview,
  "skeleton": SkeletonPreview,
  "slider": SliderPreview,
  "sonner": SonnerPreview,
  "spinner": SpinnerPreview,
  "switch": SwitchPreview,
  "table": TablePreview,
  "tabs": TabsPreview,
  "textarea": TextareaPreview,
  "toggle": TogglePreview,
  "toggle-group": ToggleGroupPreview,
  "tooltip": TooltipPreview,
};

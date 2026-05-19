import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface SideItemType {
  href: string;
  icon?: IconProp;
  label: string;
  childrens?: SideItemType[];
}

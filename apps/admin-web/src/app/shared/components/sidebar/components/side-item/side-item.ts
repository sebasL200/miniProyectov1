import { Component, input } from '@angular/core';
import { SideItemType } from './side-item.types';
import { SideItemGroup } from "../side-item-group/side-item-group";
import { SideItemOption } from "../side-item-option/side-item-option";

@Component({
  selector: 'ecom-side-item',
  imports: [SideItemGroup, SideItemOption],
  templateUrl: './side-item.html',
  styleUrl: './side-item.css',
})
export class SideItem {

  item = input.required<SideItemType>();
}

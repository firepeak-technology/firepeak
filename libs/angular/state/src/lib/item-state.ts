import {Injectable} from '@angular/core';
import {AbstractState} from "./abstract-state";


@Injectable()
export abstract class ItemState<Item, ID extends keyof Item> extends AbstractState<Item, Item[ID], Item> {
  protected currentValue: Item | null = null;

  protected override clearCurrentValue() {
    this.currentValue = null
  }

  protected override setCurrentValue(item: Item) {
    this.currentValue = item
  }

  protected override updateItem(updatedItem: Item) {
    this.updateData(updatedItem)
    this.currentValue = updatedItem
  }

  protected override createItem(item: Item ) {
    this.updateData(item)
    this.currentValue = item
  }

  protected override deleteItem(id: Item[ID]) {
    this.updateData(null)
    this.currentValue = null
  }

  public select(key: keyof Item){
    return this.selectData(key)
  }
}

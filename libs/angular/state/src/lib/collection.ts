import {Injectable} from '@angular/core';
import {AbstractState} from "./abstract-state";


@Injectable()
export abstract class Collection<Item, ID extends keyof Item> extends AbstractState<Item[], Item[ID], Item> {
  protected readonly abstract idKey: ID;
  protected readonly currentValues = new Map<Item[ID], Item>();

  protected override clearCurrentValue() {
    this.currentValues.clear()
  }


  protected override setCurrentValue(items: Item[]) {
    if(!items){this.currentValues.clear()}
    items.forEach(item =>
      this.currentValues.set(this.getId(item), item))
  }


  private isId(id: Item[ID], item2: Item) {
    return id === item2[this.idKey];
  }

  private isSameId(item1: Item, item2: Item) {
    return item1[this.idKey] === item2[this.idKey];
  }

  private getId(item: Item) {
    return item[this.idKey];
  }

  protected override createItem(item: Item) {
    this.updateItems(items => [...items, item])
    this.currentValues.set(this.getId(item), item);
  }

  protected override updateItem(updatedItem: Item) {
    this.updateItems(items => items.map(item => this.isSameId(updatedItem, item) ? updatedItem : item))

    this.currentValues.set(this.getId(updatedItem), updatedItem);
  }

  protected override deleteItem(id: Item[ID]) {
    this.updateItems(items => items.filter(item => this.isId(id, item)))
    this.currentValues.delete(id);
  }

  private updateItems(updateFn: (items: Item[]) => Item[]) {
    const items = this.getData() ?? []
    this.updateData(items)
    return items
  }
}

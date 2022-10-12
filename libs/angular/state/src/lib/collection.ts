import {Injectable} from '@angular/core';
import {AbstractState} from "./abstract-state";
import {addCollectionItem, CollectionUtil, removeCollectionItem, updateCollectionItem} from "./utils";


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

  private getId(item: Item) {
    return item[this.idKey];
  }

  protected override createItem(item: Item) {
    this.updateItems(items => addCollectionItem(  items, item))
    this.currentValues.set(this.getId(item), item);
  }

  protected override updateItem(updatedItem: Item) {
    this.updateItems(items => updateCollectionItem(this.idKey, items, updatedItem))

    this.currentValues.set(this.getId(updatedItem), updatedItem);
  }

  protected override deleteItem(id: Item[ID]) {
    this.updateItems(items => removeCollectionItem(this.idKey,items, id))
    this.currentValues.delete(id);
  }

  private updateItems(updateFn: (items: Item[]) => Item[]) {
    const items = this.getData() ?? []
    this.updateData(items)
    return items
  }
}

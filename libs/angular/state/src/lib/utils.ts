
export function isSameId<Item>(key: keyof Item, item1: Item, item2: Item): boolean {
  return item1[key] === item2[key];
}
export function isSameIdValue< Item, Key extends keyof Item>(key: Key, item: Item, keyValue:  Item[Key]): boolean {
  return item[key] === keyValue;
}

export function updateCollectionItem< Item, Key extends keyof Item>(key: Key, items: Item[], updatedItem: Item): Item[] {
  return items.map(item => isSameId(key, updatedItem, item) ? updatedItem : item)
}

export function addCollectionItem< Item, >( items: Item[], newItem: Item): Item[] {
  return [...items, newItem]
}

export function removeCollectionItem< Item, Key extends keyof Item>( key: Key,items: Item[], keyValue: Item[Key]) :Item[]{
  return items.filter(item => !isSameIdValue(key, item, keyValue))
}


export function findValue< Item, Key extends keyof Item>( key: Key,items: Item[], keyValue: Item[Key]) :Item | null{
  return items.find(item => isSameIdValue(key, item, keyValue)) ?? null
}


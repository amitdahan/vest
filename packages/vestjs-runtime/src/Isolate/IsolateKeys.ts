export enum IsolateKeys {
  Type = '$type',
  Keys = 'keys',
  Key = 'key',
  Parent = 'parent',
  Data = 'data',
  AllowReorder = 'allowReorder',
  Status = 'status',
  AbortController = 'abortController',
  Children = 'children',
}

export enum MinifiedKeys {
  Type = '$',
  Keys = 'Ks',
  Key = 'ky',
  Parent = 'P',
  Data = 'D',
  AllowReorder = 'AR',
  Status = 'S',
  Children = 'C',
}

export const KeyToMinified = {
  [IsolateKeys.Type]: MinifiedKeys.Type,
  [IsolateKeys.Keys]: MinifiedKeys.Keys,
  [IsolateKeys.Parent]: MinifiedKeys.Parent,
  [IsolateKeys.Data]: MinifiedKeys.Data,
  [IsolateKeys.Key]: MinifiedKeys.Key,
  [IsolateKeys.AllowReorder]: MinifiedKeys.AllowReorder,
  [IsolateKeys.Status]: MinifiedKeys.Status,
};

// This const is an object that looks like this:
// {
//   '$': '$type',
//   'K': 'keys',
//   'P': 'parent',
//   ...
// }
export const MinifiedToKey = Object.entries(KeyToMinified).reduce(
  (acc, [key, minified]) =>
    Object.assign(acc, {
      [minified]: key,
    }),
  {} as Record<string, IsolateKeys>
);

export const ExcludedFromDump = [
  IsolateKeys.AbortController,
  IsolateKeys.Parent,
  IsolateKeys.Keys,
  IsolateKeys.Children,
];

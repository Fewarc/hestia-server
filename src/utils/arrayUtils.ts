export function uniqBy(a: any[], key: any) {
  var index: any[] = [];
  return a.filter(function (item) {
      var k = key(item);
      return index.indexOf(k) >= 0 ? false : index.push(k);
  });
}
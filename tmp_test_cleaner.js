function clean(raw) {
  let s = raw.split(",")[0].trim();
  // Remove leading numbers/fractions/spaces
  s = s.replace(/^[\d\s./\-\u00bd\u00bc\u00be\u2153\u2154]+/g, "").trim();
  const stopWords = new Set([
    "cup","cups","tbsp","tsp","oz","lb","g","ml","l",
    "pound","pounds","ounce","ounces","tablespoon","tablespoons",
    "teaspoon","teaspoons","pinch","dash","can","cans",
    "piece","pieces","slice","slices","clove","cloves",
    "bunch","bunches","head","heads","sprig","sprigs",
    "medium","large","small","whole","fresh","chopped",
    "diced","sliced","minced","grated","peeled","cored","of","a","the"
  ]);
  const words = s.split(/\s+/).filter(w => w && !stopWords.has(w.toLowerCase()));
  return words.length > 0 ? words[words.length - 1] : "";
}
const tests = ["4 eggs", "2 medium tomatoes", "1/2 cup chopped onions", "1 tablespoon olive oil", "1/4 cup grated parmesan cheese", "Salt", "Fresh basil leaves", "Ground black pepper"];
tests.forEach(t => console.log(t, "=>", clean(t)));

import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
import { workerEvents } from "../events/constants.js";

console.log("Model training worker initialized");
let _globalCtx = {};

//Formula: (val - min) / (max - min)
//Exemplo: idade 30, min 18, max 60 -> (30 - 18) / (60 - 18) = 0.2857
function normalize(value, min, max) {
  if (max === min) return 0.5; // Evita divisão por zero
  return (value - min) / (max - min);
}

function makeContext(users, catalog) {
  const ages = users.map((u) => u.age);
  const prices = catalog.map((p) => p.price);

  debugger;

  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  debugger;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  debugger;

  const colors = [...new Set(catalog.map((p) => p.color))];
  const categories = [...new Set(catalog.map((p) => p.category))];

  debugger;

  const colorIndex = Object.entries(
    colors.map((color, index) => {
      return [color, index];
    }),
  );

  debugger;

  const categoryIndex = Object.entries(
    categories.map((category, index) => {
      return [category, index];
    }),
  );

  debugger;

  //Computar a media de idade dos compradores por produto
  //(ajuda a personalizar)

  const midAge = (minAge + maxAge) / 2;
  const ageSums = {}; //soma das idades por produto
  const ageCounts = {}; //quantidade de compradores por produto
  const midPrice = (minPrice + maxPrice) / 2;

  debugger;

  users.forEach((user) => {
    user.purchases.forEach((p) => {
      ageSums[p.name] = (ageSums[p.name] || 0) + user.age;
      ageCounts[p.name] = (ageCounts[p.name] || 0) + 1;
    });
  });

  debugger;

  const productAvgAgeNorm = Object.fromEntries(
    catalog.map((product) => {
      const avg = ageCounts[product.name]
        ? ageSums[product.name] / ageCounts[product.name]
        : midAge;

      return [product.name, normalize(avg, minAge, maxAge)];
    }),
  );

  debugger;

  return {
    minAge,
    maxAge,
    minPrice,
    catalog,
    users,
    colorIndex,
    categoryIndex,
    productAvgAgeNorm,
    numCategories: categories.length,
    numColors: colors.length,
    dimentions: 2 + categories.length + colors.length, // idade, preço, categorias e cores
  };
}

async function trainModel({ users }) {
  console.log("Training model with users:", users);

  const catalog = await (await fetch("../../data/products.json")).json();
  const context = makeContext(users, catalog);

  postMessage({
    type: workerEvents.progressUpdate,
    progress: { progress: 50 },
  });
  postMessage({
    type: workerEvents.trainingLog,
    epoch: 1,
    loss: 1,
    accuracy: 1,
  });

  setTimeout(() => {
    postMessage({
      type: workerEvents.progressUpdate,
      progress: { progress: 100 },
    });
    postMessage({ type: workerEvents.trainingComplete });
  }, 1000);
}
function recommend(user, ctx) {
  console.log("will recommend for user:", user);
  // postMessage({
  //     type: workerEvents.recommend,
  //     user,
  //     recommendations: []
  // });
}

const handlers = {
  [workerEvents.trainModel]: trainModel,
  [workerEvents.recommend]: (d) => recommend(d.user, _globalCtx),
};

self.onmessage = (e) => {
  const { action, ...data } = e.data;
  if (handlers[action]) handlers[action](data);
};

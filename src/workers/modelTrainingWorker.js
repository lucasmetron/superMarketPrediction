import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
import { workerEvents } from "../events/constants.js";

console.log("Model training worker initialized");
let _globalCtx = {};

const WEIGHTS = {
  category: 0.4,
  color: 0.3,
  price: 0.2,
  age: 0.1,
};

//Formula: (val - min) / (max - min)
//Exemplo: idade 30, min 18, max 60 -> (30 - 18) / (60 - 18) = 0.2857
function normalize(value, min, max) {
  if (max === min) return 0.5; // Evita divisão por zero
  return (value - min) / (max - min);
}

function makeContext(users, products) {
  const ages = users.map((u) => u.age);
  const prices = products.map((p) => p.price);

  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const colors = [...new Set(products.map((p) => p.color))];
  const categories = [...new Set(products.map((p) => p.category))];

  const colorsIndex = Object.fromEntries(
    colors.map((color, index) => {
      return [color, index];
    }),
  );

  const categoryIndex = Object.fromEntries(
    categories.map((category, index) => {
      return [category, index];
    }),
  );

  //Computar a media de idade dos compradores por produto
  //(ajuda a personalizar)

  const midAge = (minAge + maxAge) / 2;
  const ageSums = {}; //soma das idades por produto
  const ageCounts = {}; //quantidade de compradores por produto
  const midPrice = (minPrice + maxPrice) / 2;

  users.forEach((user) => {
    user.purchases.forEach((p) => {
      ageSums[p.name] = (ageSums[p.name] || 0) + user.age;
      ageCounts[p.name] = (ageCounts[p.name] || 0) + 1;
    });
  });

  const productAvgAgeNorm = Object.fromEntries(
    products.map((product) => {
      const avg = ageCounts[product.name]
        ? ageSums[product.name] / ageCounts[product.name]
        : midAge;

      return [product.name, normalize(avg, minAge, maxAge)];
    }),
  );

  return {
    minAge,
    maxAge,
    minPrice,
    maxPrice,
    products,
    users,
    colorsIndex,
    categoryIndex,
    productAvgAgeNorm,
    numCategories: categories.length,
    numColors: colors.length,
    dimentions: 2 + categories.length + colors.length, // idade, preço, categorias e cores
  };
}

const oneHotWeighted = (index, length, weight) => {
  return tf.oneHot(index, length).cast("float32").mul(weight);
};

function encodeProduct(product, context) {
  //normalizando dados para ficar de 0 a 1 e aplicar os pesos na recomendação
  const price = tf.tensor1d([
    normalize(product.price, context.minPrice, context.maxPrice) *
      WEIGHTS.price,
  ]);

  const age = tf.tensor1d([
    (context.productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age,
  ]);

  const category = oneHotWeighted(
    context.categoryIndex[product.category],
    context.numCategories,
    WEIGHTS.category,
  );

  const color = oneHotWeighted(
    context.colorsIndex[product.color],
    context.numColors,
    WEIGHTS.color,
  );

  return tf.concat([price, age, category, color]);
}

function encodeUser(user, context) {
  if (user.purchases.length) {
    return tf
      .stack(user.purchases.map((p) => encodeProduct(p, context)))
      .mean(0)
      .reshape([1, context.dimentions]);
  }
}

function createTraningData(context) {
  const inputs = [];
  const labels = [];

  context.users.forEach((user) => {
    const userVector = encodeUser(user, context).dataSync();
    context.products.forEach((product) => {
      const productVector = encodeProduct(product, context).dataSync();
      const label = user.purchases.some((p) => p.name === product.name) ? 1 : 0;
      inputs.push([...userVector, ...productVector]);
      labels.push(label);
    });
  });

  return {
    xs: tf.tensor2d(inputs),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimension: context.dimentions * 2,
  };
}

async function trainModel({ users }) {
  console.log("Training model with users:", users);

  const products = await (await fetch("../../data/products.json")).json();
  const context = makeContext(users, products);

  context.productVectors = products.map((product) => {
    return {
      name: product.name,
      meta: { ...product },
      vector: encodeProduct(product, context).dataSync(),
    };
  });

  _globalCtx = context;

  const trainingData = createTraningData(context);

  debugger;
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

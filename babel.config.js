module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],

    // plugins: [["module-resolver", {
    //   root: ["./"],

    //   alias: {
    //     "@/modules": "./modules/",
    //     "@": "./src/"
    //   }
    // }]],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};

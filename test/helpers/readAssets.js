import readAsset from "./readAsset";

export default function readAssets(stats) {
  const assets = {};

  Object.keys(stats.compilation.assets).forEach((asset) => {
    assets[asset] = readAsset(asset, stats);
  });

  return assets;
}

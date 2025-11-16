export function getDiscountInfo(product) {
  const finalPrice = Number(product.FinalPrice || 0);
  const suggested = Number(product.SuggestedRetailPrice || 0);

  const isDiscounted = suggested && finalPrice < suggested;
  const discountAmount = isDiscounted ? (suggested - finalPrice).toFixed(2) : 0;
  const discountPercent = isDiscounted
    ? Math.round(((suggested - finalPrice) / suggested) * 100)
    : 0;

  return {
    isDiscounted,
    finalPrice,
    suggested,
    discountAmount,
    discountPercent
  };
}

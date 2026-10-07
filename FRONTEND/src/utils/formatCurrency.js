export const formatCurrency = (amount, currency = 'NPR') => {
  const value = Number(amount ?? 0);

  switch (currency) {
    case 'USD':
      return `$${value.toFixed(2)}`;
    case 'EUR':
      return `€${value.toFixed(2)}`;
    case 'GBP':
      return `£${value.toFixed(2)}`;
    case 'NPR':
    default:
      return `Rs ${value.toFixed(2)}`;
  }
};

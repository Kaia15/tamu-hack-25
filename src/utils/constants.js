export const GroceryData = [];

export const categories = ["Grocery", "Merchandise", "Dining", "Travel", "Entertainment"];

export const cards = categories.reduce((acc, category_name) => {
  acc[category_name] = {
    category: category_name,
    spending: "188",
    limit: "300",
    start_date: "01/01/2025",
    end_date: "01/30/2025",
  };
  return acc;
}, {});

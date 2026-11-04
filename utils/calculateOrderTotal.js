
const calculateOrderTotal = (cartItems) => {
    let subtotal = 0;

    const orderItems = cartItems.map((item) => {
        const price = item.menuItem.price;
        const quantity = item.quantity;

        subtotal += price * quantity;

        return {
            menuItem: item.menuItem._id,
            quantity: quantity,
            price: price
        };
    });

    return {
        orderItems,
        subtotal,
        total: subtotal
    };
};

module.exports = calculateOrderTotal;

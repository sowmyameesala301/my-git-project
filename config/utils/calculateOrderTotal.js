
const calculateOrderTotal = (cartItems) => {
    let subtotal = 0;

    const orderItems = cartItems.map(item => {
        const price = item.menuItem.price;
        const quantity = item.quantity;
        const lineTotal = price * quantity;

        subtotal += lineTotal;

        return {
            itemName: item.menuItem.name,
            unitPrice: price,
            quantity,
            lineTotal
        };
    });

    return {
        orderItems,
        subtotal,
        total: subtotal
    };
};

module.exports = calculateOrderTotal;

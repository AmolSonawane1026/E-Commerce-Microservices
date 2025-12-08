const styles = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px; }
    .section:last-child { border-bottom: none; }
    .order-details { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .order-details th { text-align: left; padding: 10px; background-color: #f8f8f8; color: #666; font-size: 12px; text-transform: uppercase; }
    .order-details td { padding: 15px 10px; border-bottom: 1px solid #eee; }
    .product-img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px; vertical-align: middle; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; color: #1a1a1a; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-confirmed { background-color: #d1ecf1; color: #0c5460; }
    .status-shipped { background-color: #d4edda; color: #155724; }
    .status-delivered { background-color: #c3e6cb; color: #155724; }
    .status-cancelled { background-color: #f8d7da; color: #721c24; }
    .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; text-align: center; }
    .address-box { background: #f9fafb; padding: 15px; border-radius: 4px; margin-top: 5px; font-size: 14px; }
`;

exports.orderConfirmation = (data) => {
    const { order, customerName } = data;
    const itemsList = order.items.map(item => `
        <tr>
            <td>
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-img">` : ''}
                <span>${item.name}</span>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">Qty: ${item.quantity}</div>
            </td>
            <td style="text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Confirmed</h1>
                </div>
                <div class="content">
                    <p>Hello ${customerName},</p>
                    <p>Thank you for your order! We've received it and are getting it ready.</p>
                    
                    <div class="section">
                        <h3 style="margin: 0 0 10px;">Order #${order.orderNumber}</h3>
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>

                    <div class="section">
                        <table class="order-details">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                                <tr>
                                    <td style="text-align: right; font-weight: bold;">Subtotal</td>
                                    <td style="text-align: right;">₹${order.subtotal}</td>
                                </tr>
                                <tr>
                                    <td style="text-align: right;">Shipping</td>
                                    <td style="text-align: right;">${order.shippingCharges === 0 ? 'Free' : '₹' + order.shippingCharges}</td>
                                </tr>
                                <tr class="total-row">
                                    <td style="text-align: right;">Total</td>
                                    <td style="text-align: right;">₹${order.totalAmount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h3>Shipping Address</h3>
                        <div class="address-box">
                            <strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}</strong><br>
                            ${order.shippingAddress.street}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                            Phone: ${order.shippingAddress.phone}
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">View Order Details</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Need help? Contact our support team.</p>
                    <p>&copy; ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

exports.orderStatusUpdate = (data) => {
    const { order, customerName, previousStatus } = data;

    let statusMessage = '';
    switch (order.status) {
        case 'confirmed': statusMessage = 'Your order has been confirmed!'; break;
        case 'shipped': statusMessage = 'Great news! Your order is on its way.'; break;
        case 'out_for_delivery': statusMessage = 'Your order is out for delivery and will arrive soon.'; break;
        case 'delivered': statusMessage = 'Your order has been delivered. Enjoy!'; break;
        case 'cancelled': statusMessage = 'Your order has been cancelled.'; break;
        default: statusMessage = `Your order status has been updated to ${order.status}.`;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Update</h1>
                </div>
                <div class="content">
                    <p>Hello ${customerName},</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <h2 style="color: #2563eb;">${statusMessage}</h2>
                        <div class="section" style="margin-top: 20px;">
                            <span class="status-badge status-${order.status.toLowerCase()}" style="font-size: 14px; padding: 8px 16px;">
                                ${order.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Order Details</h3>
                        <p><strong>Order #:</strong> ${order.orderNumber}</p>
                        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                    </div>

                    ${order.trackingInfo && order.trackingInfo.trackingNumber ? `
                    <div class="section">
                        <h3>Tracking Information</h3>
                        <p><strong>Courier:</strong> ${order.trackingInfo.courier}</p>
                        <p><strong>Tracking Number:</strong> ${order.trackingInfo.trackingNumber}</p>
                    </div>
                    ` : ''}

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">Track Your Order</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for shopping with us!</p>
                    <p>&copy; ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

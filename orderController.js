
const db = require("../config/db");

// ======================================
// BUYER: CREATE ORDER
// ======================================

exports.createOrder = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const buyerId = Number(req.user.id);
        const {
            listing_id,
            quantity,
            delivery_address,
            buyer_note
        } = req.body;

        const listingId = Number(listing_id);
        const orderQuantity = Number(quantity);
        const address = String(delivery_address || "").trim();

        if (
            !Number.isInteger(listingId) ||
            listingId <= 0 ||
            !Number.isFinite(orderQuantity) ||
            orderQuantity <= 0 ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Listing, valid quantity and delivery address are required"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        const [listings] = await connection.query(
            `SELECT
                ml.id,
                ml.farmer_crop_id,
                ml.available_quantity,
                ml.unit,
                ml.price_per_unit,
                ml.status,
                fp.user_id AS farmer_user_id
             FROM marketplace_listings ml
             JOIN farmer_crops fc ON fc.id = ml.farmer_crop_id
             JOIN farmer_profiles fp ON fp.id = fc.farmer_id
             WHERE ml.id = ?
             FOR UPDATE`,
            [listingId]
        );

        if (listings.length === 0) {
            throw Object.assign(new Error("Marketplace listing not found"), {
                statusCode: 404
            });
        }

        const listing = listings[0];

        if (listing.status !== "ACTIVE") {
            throw Object.assign(new Error("This listing is not available"), {
                statusCode: 400
            });
        }

        if (Number(listing.farmer_user_id) === buyerId) {
            throw Object.assign(new Error("You cannot order your own listing"), {
                statusCode: 403
            });
        }

        if (orderQuantity > Number(listing.available_quantity)) {
            throw Object.assign(
                new Error(`Only ${listing.available_quantity} ${listing.unit} available`),
                { statusCode: 400 }
            );
        }

        const unitPrice = Number(listing.price_per_unit);
        const totalAmount = Number(
            (orderQuantity * unitPrice).toFixed(2)
        );

        const [orderResult] = await connection.query(
            `INSERT INTO marketplace_orders
            (
                listing_id,
                buyer_user_id,
                quantity,
                unit,
                unit_price,
                total_amount,
                delivery_address,
                buyer_note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                listing.id,
                buyerId,
                orderQuantity,
                listing.unit,
                unitPrice,
                totalAmount,
                address,
                buyer_note ? String(buyer_note).trim() : null
            ]
        );

        const remaining = Number(
            (Number(listing.available_quantity) - orderQuantity).toFixed(2)
        );

        await connection.query(
            `UPDATE marketplace_listings
             SET available_quantity = ?,
                 status = ?
             WHERE id = ?`,
            [
                remaining,
                remaining <= 0 ? "SOLD_OUT" : "ACTIVE",
                listing.id
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: {
                id: orderResult.insertId,
                listing_id: listing.id,
                quantity: orderQuantity,
                unit: listing.unit,
                unit_price: unitPrice,
                total_amount: totalAmount,
                status: "PENDING"
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Create Order Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to place order"
        });

    } finally {
        if (connection) connection.release();
    }
};


// ======================================
// BUYER: GET OWN ORDERS
// ======================================

exports.getBuyerOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT
                o.*,
                c.crop_name,
                farmer.full_name AS farmer_name,
                farmer.phone AS farmer_phone
             FROM marketplace_orders o
             JOIN marketplace_listings ml
                ON ml.id = o.listing_id
             JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id
             JOIN crops c
                ON c.id = fc.crop_id
             JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             JOIN users farmer
                ON farmer.id = fp.user_id
             WHERE o.buyer_user_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            total: orders.length,
            orders
        });

    } catch (error) {
        console.error("Buyer Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your orders"
        });
    }
};


// ======================================
// FARMER: GET INCOMING ORDERS
// ======================================

exports.getFarmerOrders = async (req, res) => {
    try {
        const farmerUserId = Number(req.user.id);

        const [orders] = await db.query(
            `SELECT
                o.id,
                o.listing_id,
                o.buyer_user_id,
                o.quantity,
                o.unit,
                o.unit_price,
                o.total_amount,
                o.delivery_address,
                o.buyer_note,
                o.status,
                o.created_at,
                o.updated_at,

                c.crop_name,

                buyer.full_name AS buyer_name,
                buyer.phone AS buyer_phone

             FROM marketplace_orders o

             JOIN marketplace_listings ml
                ON ml.id = o.listing_id

             JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id

             JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id

             JOIN crops c
                ON c.id = fc.crop_id

             JOIN users buyer
                ON buyer.id = o.buyer_user_id

             WHERE fp.user_id = ?

             ORDER BY o.created_at DESC`,
            [farmerUserId]
        );

        return res.status(200).json({
            success: true,
            total: orders.length,
            orders
        });

    } catch (error) {
        console.error("Farmer Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load incoming orders"
        });
    }
};


// ======================================
// FARMER: UPDATE ORDER STATUS
// ACCEPTED / REJECTED / COMPLETED
// ======================================

exports.updateOrderStatus = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const farmerUserId = Number(req.user.id);
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "ACCEPTED",
            "REJECTED",
            "COMPLETED"
        ];

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        const [rows] = await connection.query(
            `SELECT
                o.*,
                ml.id AS listing_id,
                ml.farmer_crop_id,
                fc.farmer_id,
                fp.user_id AS farmer_user_id,
                buyer.full_name AS buyer_name

             FROM marketplace_orders o

             JOIN marketplace_listings ml
                ON ml.id = o.listing_id

             JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id

             JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id

             JOIN users buyer
                ON buyer.id = o.buyer_user_id

             WHERE o.id = ?

             FOR UPDATE`,
            [orderId]
        );

        if (rows.length === 0) {
            throw Object.assign(new Error("Order not found"), {
                statusCode: 404
            });
        }

        const order = rows[0];

        // Verify listing ownership
        if (Number(order.farmer_user_id) !== farmerUserId) {
            throw Object.assign(
                new Error("You cannot manage another farmer's order"),
                { statusCode: 403 }
            );
        }

        // ======================================
        // ACCEPT ORDER
        // ======================================

        if (status === "ACCEPTED") {
            if (order.status !== "PENDING") {
                throw Object.assign(
                    new Error("Only pending orders can be accepted"),
                    { statusCode: 400 }
                );
            }

            // Add marketplace sale once, when accepted.
            await connection.query(
                `INSERT INTO crop_sales
                (
                    farmer_crop_id,
                    marketplace_listing_id,
                    quantity,
                    unit,
                    unit_price,
                    total_amount,
                    sale_date,
                    buyer_name,
                    sale_type,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, 'MARKETPLACE', ?)`,
                [
                    order.farmer_crop_id,
                    order.listing_id,
                    order.quantity,
                    order.unit,
                    order.unit_price,
                    order.total_amount,
                    order.buyer_name,
                    `Marketplace Order #${orderId}`
                ]
            );

            await connection.query(
                `UPDATE marketplace_orders
                 SET status = 'ACCEPTED'
                 WHERE id = ?`,
                [orderId]
            );

            await connection.commit();
            transactionStarted = false;

            return res.status(200).json({
                success: true,
                message: "Order accepted. Sale added to farmer income.",
                order_id: orderId,
                status: "ACCEPTED",
                sale_amount: Number(order.total_amount)
            });
        }

        // ======================================
        // REJECT ORDER
        // Restore reserved quantity
        // ======================================

        if (status === "REJECTED") {
            if (order.status !== "PENDING") {
                throw Object.assign(
                    new Error("Only pending orders can be rejected"),
                    { statusCode: 400 }
                );
            }

            const [listingRows] = await connection.query(
                `SELECT available_quantity
                 FROM marketplace_listings
                 WHERE id = ?
                 FOR UPDATE`,
                [order.listing_id]
            );

            if (listingRows.length === 0) {
                throw new Error("Marketplace listing not found");
            }

            const restoredQuantity = Number(
                (
                    Number(listingRows[0].available_quantity) +
                    Number(order.quantity)
                ).toFixed(2)
            );

            await connection.query(
                `UPDATE marketplace_listings
                 SET available_quantity = ?,
                     status = 'ACTIVE'
                 WHERE id = ?`,
                [restoredQuantity, order.listing_id]
            );

            await connection.query(
                `UPDATE marketplace_orders
                 SET status = 'REJECTED'
                 WHERE id = ?`,
                [orderId]
            );

            await connection.commit();
            transactionStarted = false;

            return res.status(200).json({
                success: true,
                message: "Order rejected and listing quantity restored",
                order_id: orderId,
                status: "REJECTED"
            });
        }

        // ======================================
        // COMPLETE DELIVERY
        // ======================================

        if (status === "COMPLETED") {
            if (order.status !== "ACCEPTED") {
                throw Object.assign(
                    new Error("Only accepted orders can be completed"),
                    { statusCode: 400 }
                );
            }

            await connection.query(
                `UPDATE marketplace_orders
                 SET status = 'COMPLETED'
                 WHERE id = ?`,
                [orderId]
            );

            await connection.commit();
            transactionStarted = false;

            return res.status(200).json({
                success: true,
                message: "Delivery marked as completed successfully",
                order_id: orderId,
                status: "COMPLETED",
                sms_status: "SMS gateway integration pending"
            });
        }

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Update Order Status Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to update order status"
        });

    } finally {
        if (connection) connection.release();
    }
};

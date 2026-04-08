-- Seed data for E-commerce Solution
-- This migrates data from the original db.json file

-- Insert sellers (updated to match actual database)
INSERT INTO sellers (id, name, email, password) VALUES
('36cc9a05-f337-400d-8d3e-bdf757b925ad', 'Jils', 'jils@seller.com', '$2a$10$FuamiyzaxBPcR6ibyHteHOX9e9d/zPbCt0zI6vsrPR3kFOl74KK6i'),  -- Actual password hash from your DB abc@123
('9b95', 'seller1', 'seller1@gmail.com', '$2a$10$YqY8Z1Z8Z1Z8Z1Z8Z1Z8Z.jK5JZ5JZ5JZ5JZ5JZ5JZ5JZ5JZj'),  -- Password: seller1@123
('seller-2', 'Gadget Hub', 'seller2@test.com', '$2b$10$wLd3nJzX9zX9zX9zX9zX9eX9zX9zX9zX9zX9zX9zX9zX9zX9zX9z'); -- Seller 2 (For testing isolation)

-- Insert users (updated to match actual database)
INSERT INTO users (id, name, email, password) VALUES
('c4132b25-f75b-4a1b-9063-936872373277', 'Jils', 'jils@user.com', '$2a$10$6sP1YNRqvi.Ry4RfLmxJHeTh9U5oG.Z3NNkE0pLr5Gf.UvZDiHuPi'),  -- Actual password hash from your DB abc@123
('745b4028-170e-48aa-b792-f6bba5a50e7c', 'user1', 'user1@gmail.com', '$2a$10$KOz8h6JeuahkB0yd3BdeLus6WCjGbxcxmlTbBFyeDndezdlUxxlVa');  -- Actual password hash from your DB

-- Insert products (using actual seller UUID)
INSERT INTO products (id, name, price, category, color, description, image, seller_id) VALUES
('6fdf', 'Samsung m33 5G', 18999.00, 'Mobile', 'Darkgreen', 'The Samsung M33 5G offers exceptional performance and features in the midrange segment, delivering a seamless 5G experience alongside top-tier mobile capabilities.', 'https://m.media-amazon.com/images/I/41t61osAZHL.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('8fe3', 'Samsung S24 Ultra', 139999.00, 'Mobile', 'Black', 'The Samsung Galaxy S24 Ultra stands out as a top-tier mobile device, excelling in handling heavy tasks effortlessly, making it the ideal choice for demanding users seeking unparalleled performance.', 'https://ampro.in/wp-content/uploads/2024/01/Samsung-Galaxy-S24-Ultra-5G-5-2.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('2b75', 'Dell Gaming Laptop', 79999.00, 'Laptop', 'Darkgray', 'The Dell gaming laptop with an i5 processor offers a compelling combination of performance and affordability, delivering an exceptional gaming experience with its powerful processing capabilities and robust features.', 'https://images-cdn.ubuy.co.in/634f18d1c43db308a82faefa-dell-g15-5511-gaming-laptop-2021.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('4ec4', 'Apple Macbook Laptop', 149999.00, 'Laptop', 'Gray', 'The Apple MacBook Air is renowned for its seamless integration, exceptional performance, and reliability, making it the best laptop for everyday tasks.', 'https://5.imimg.com/data5/WB/IN/SI/SELLER-11247776/apple-macbook-laptop.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('5496', 'Sony Bravia 55" 4K TV', 139990.00, 'TV', 'Black', 'Experience unparalleled visual immersion and audio excellence with the Sony Bravia 55" 4K TV, offering the best combination of stunning resolution and superior sound quality for an unmatched entertainment experience.', 'https://www.andreselectronicexperts.com/files/image/attachment/51257/55A80K.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('6ae7', 'Mi 32" HD TV', 15000.00, 'TV', 'Black', 'Enjoy immersive viewing experiences with the Mi 32" HD TV, delivering vibrant visuals and crisp details in high definition, perfect for enhancing your entertainment setup with affordability and quality.', 'https://manoharmobiles.com/wp-content/uploads/2022/01/mi-tv-4a-pro-80-cm-32-inches-hd-ready-android-led-tv-black-with-data-saver-500x500-1.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('ddf6', 'Canon Camera', 126990.00, 'Camera', 'Darkgray', 'Capture life''s moments in stunning detail with a Canon camera, renowned for its exceptional image quality, reliability, and advanced features, making it the perfect choice for photographers of all levels.', 'https://x.imastudent.com/content/0016823_canon-eos-90d-dslr-camera-with-18-135mm-lens_500.jpeg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('a029', 'Sony A9 Mirrorless', 320000.00, 'Camera', 'Black,White', 'Capture life''s moments with breathtaking clarity and precision using the Sony A9 Mirrorless Camera, renowned for its unparalleled speed, exceptional image quality, and advanced features, making it the ultimate choice for professional photographers and enthusiasts alike.', 'https://cdn.fstoppers.com/styles/large-16-9/s3/lead/2017/07/sony-alpha-a9-camera-for-wildlife-photography-review.jpg', '36cc9a05-f337-400d-8d3e-bdf757b925ad'),
('prod-6', 'Dell XPS 15', 189990.00, 'Laptop', 'Silver', 'Creator edition laptop.', 'https://via.placeholder.com/400x300?text=Dell+XPS', 'seller-2'),
('prod-7', 'iPad Air', 59900.00, 'Electronics', 'Blue', 'Light. Bright. Full of might.', 'https://via.placeholder.com/400x300?text=iPad+Air', 'seller-2'),
('prod-8', 'OnePlus 12', 64999.00, 'Mobile', 'Flowy Emerald', 'Smooth beyond belief.', 'https://via.placeholder.com/400x300?text=OnePlus+12', 'seller-2');

-- Insert cart items (assigning to actual users)
INSERT INTO cart (id, user_id, product_id, quantity) VALUES
('7b03', 'c4132b25-f75b-4a1b-9063-936872373277', '6fdf', 1),  -- Jils' cart
('a28b', '745b4028-170e-48aa-b792-f6bba5a50e7c', '2b75', 1);  -- user1's cart

-- Insert orders (using actual user UUIDs)
INSERT INTO orders (id, user_id, name, email, address, pincode, contact, total_price, order_status) VALUES
('8d70', 'c4132b25-f75b-4a1b-9063-936872373277', 'Jils', 'jils@user.com', 'ahmedabad', 380006, '9876543210', 155099.00, 'Delivered'),
('07ef', 'c4132b25-f75b-4a1b-9063-936872373277', 'Jils', 'jils@user.com', 'ahmedabad', 380006, '9876543210', 146089.00, 'InProgress'),
('432c', 'c4132b25-f75b-4a1b-9063-936872373277', 'Jils', 'jils@user.com', 'ahmedabad', 380006, '9876543210', 80099.00, 'Shipped'),
('660b', '745b4028-170e-48aa-b792-f6bba5a50e7c', 'user1', 'user1@gmail.com', '123 Main Street, ABC Colony, Bangalore, Karnataka, India.', 560001, '9876543210', 220089.00, 'Packed');

-- Insert order items (derived from orders items field)
INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity) VALUES
-- Order 8d70: Samsung S24 Ultra, Mi 32" HD TV
('oi1', '8d70', '8fe3', 'Samsung S24 Ultra', 139999.00, 1),
('oi2', '8d70', '6ae7', 'Mi 32" HD TV', 15000.00, 1),
-- Order 07ef: Canon Camera, Samsung m33 5G
('oi3', '07ef', 'ddf6', 'Canon Camera', 126990.00, 1),
('oi4', '07ef', '6fdf', 'Samsung m33 5G', 18999.00, 1),
-- Order 432c: Dell Gaming Laptop
('oi5', '432c', '2b75', 'Dell Gaming Laptop', 79999.00, 1),
-- Order 660b: Sony Bravia 55" 4K TV, Dell Gaming Laptop
('oi6', '660b', '5496', 'Sony Bravia 55" 4K TV', 139990.00, 1),
('oi7', '660b', '2b75', 'Dell Gaming Laptop', 79999.00, 1);

-- Insert feedback
INSERT INTO feedback (id, customer_name, rating, product_name, review) VALUES
('b700', 'jils patel', 5, 'Samsung M33 5G', 'The Samsung M33 5G impresses with its lightning-fast 5G connectivity, vibrant display, and long-lasting battery. Its top-notch camera ensures stunning photos in any lighting, making it a reliable and feature-rich smartphone choice.'),
('9c55', 'Emma Johnson', 4, 'Sony 55" 4K TV', 'The Sony 55" 4K TV delivers an immersive viewing experience with its stunning picture quality and vibrant colors. Its 4K resolution brings movies and shows to life, while the smart features provide easy access to a wide range of content. With sleek design and excellent performance, this TV is a top choice for any home entertainment setup.');

-- Insert contact messages
INSERT INTO contact_messages (id, name, email, message) VALUES
('a5c4', 'Jils', 'jils@user.com', 'Good Product'),
('29ba', 'Jils', 'jils@user.com', 'You Selling Good Product');
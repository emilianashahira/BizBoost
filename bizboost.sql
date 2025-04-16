-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2025 at 01:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bizboost`
--

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `hours_operation` text DEFAULT NULL,
  `price_range` varchar(50) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','deactivated') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` enum('Food','Apparel','Others') NOT NULL DEFAULT 'Others'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`id`, `owner_id`, `name`, `description`, `location`, `address`, `contact`, `hours_operation`, `price_range`, `images`, `main_image`, `status`, `created_at`, `category`) VALUES
(26, 16, 'RedBean Closet', 'Redbean Closet offers fun, colorful, and unique fashion pieces that bring joy and style to your wardrobe. From quirky designs to bold accessories, they cater to those who love to express their individuality. Shop online or visit their store in Seapark, Petaling Jaya.', 'Petaling Jaya', '35A, Jalan 21/12, Sea Park Kuala Lumpur, 46300 Petaling Jaya, Selangor', 'Instagram: @redbeancloset', 'Mon : Closed\nTue : 11:30 am - 5:00 pm\nWed : 11:30 am - 5:00 pm\nThu : 11:30 am - 5:00 pm\nFri : 11:30 am - 5:00 pm\nSat : 11:30 am - 6:00 pm\nSun : 11:30 am - 6:00 pm', 'RM 50 - RM 200', '/uploads/1744160327404-Image 1.jpg,/uploads/1744160402741-Image 2.jpg,/uploads/1744160406615-Image 4.jpg,/uploads/1744160413522-Image 3.jpg', '/uploads/1744160064154-LOGOOOOO.jpg', 'approved', '2025-04-09 00:48:14', 'Apparel'),
(30, 17, 'Wuli Cafe', 'Wuli Cafe is your go-to spot for refreshing Korean bingsoo, specialty coffee, and tea. Located at Shamelin Star, we offer a cozy space to relax and enjoy sweet treats made to satisfy every craving.', 'Kuala Lumpur', 'G-23a, Shamelin Star Residence, Jalan 4/91, Taman Shamelin Perkasa, 56100 Kuala Lumpur', 'Instagram: @wuli.cafe', 'Mon : 11:00 am - 9:00 pm\nTue : 11:00 am - 9:00 pm\nWed : 11:00 am - 9:00 pm\nThu : 11:00 am - 9:00 pm\nFri : 11:00 am - 9:00 pm\nSat : 11:00 am - 9:00 pm\nSun : closed', 'RM 3.90 - RM 18.90', '/uploads/1744176499248-Image 1.jpeg,/uploads/1744176506993-Image 2.jpg', '/uploads/1744176362425-LOGO.jpeg', 'approved', '2025-04-09 00:50:26', 'Food'),
(36, 24, 'RimbunKL', 'RimbunKL is a modern fashion brand reimagining the traditional kebaya with bold, playful, and genderless designs. Blending heritage with contemporary style, each piece reflects a unique story and creative spirit. Explore their collection online or in-store in Puchong.', 'Puchong', '20, Jalan Tasik Prima 6/2, Taman Tasik Prima, 47100 Puchong, Selangor', 'Instagram: @rimbunkl', 'Mon : 12:00 pm - 8:00 pm\nTue : 12:00 pm - 8:00 pm\nWed : 12:00 pm - 8:00 pm\nThu : 12:00 pm - 8:00 pm\nFri : 12:00 pm - 8:00 pm\nSat : 12:00 pm - 8:00 pm\nSun : 12:00 pm - 8:00 pm', 'RM 20 - RM 190', '/uploads/1744570678817-490114152_18052936574462344_8578680382798175478_n.jpg,/uploads/1744570683302-491458947_18052936619462344_2048623308773032454_n.jpg,/uploads/1744570688878-490373912_18052936628462344_3552088397529187042_n.jpg', '/uploads/1744570613919-353802706_5719895648111096_5599946828932848347_n.jpg', 'approved', '2025-04-13 18:54:25', 'Apparel'),
(37, 25, 'Kooky Plate', 'Kooky Plate is a cozy café in Chow Kit, Kuala Lumpur, serving creative fusion dishes, decadent desserts, and specialty coffee. With a modern, playful vibe, it’s the perfect spot for brunch, sweet treats, or a relaxing catch-up over coffee.', 'Kuala Lumpur', 'No.16, Seksyen 41, Jalan Yap Ah Shak, Chow Kit, 50300 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur', 'Instagram: @kookyplate', 'Mon : 11:00 am - 10:00 pm\nTue : 11:00 am - 10:00 pm\nWed : 11:00 am - 10:00 pm\nThu : 11:00 am - 10:00 pm\nFri : 11:00 am - 10:00 pm\nSat : 9:00 am - 10:00 pm\nSun : 9:00 am - 10:00 pm', 'RM20 - RM40', '/uploads/1744571924976-unnamed.jpg,/uploads/1744571930236-unnamed (1).jpg,/uploads/1744571938028-unnamed (2).jpg,/uploads/1744571943944-unnamed (3).jpg', '/uploads/1744571915828-316529236_135399779300858_6674086465017491083_n.jpg', 'approved', '2025-04-13 19:15:53', 'Food'),
(38, 26, 'IMOMENT CAFÉ', 'Imoment Cafe is a floral-themed café in Bangsar South, serving beautifully crafted cakes, refreshing drinks, and hearty brunch bites. With its bright, elegant interior, it\'s the perfect spot to unwind, celebrate sweet moments, or enjoy a cozy catch-up.', 'Bangsar', 'GF, Melilea Tower, Bangsar South. 6, Avenue 3 The Horizon, Jalan Kerinchi, Bangsar, 59200 Kuala Lumpur', 'Instagram: @imoment.cafe_malaysia', 'Mon : 8:00 am - 8:00 pm\nTue : 8:00 am - 8:00 pm\nWed : 8:00 am - 8:00 pm\nThu : 8:00 am - 8:00 pm\nFri : 8:00 am - 8:00 pm\nSat : 8:00 am - 8:00 pm\nSun : Closed', 'RM20 - RM40', '/uploads/1744572945198-488362280_17874053478303054_4425400369184823622_n.jpg,/uploads/1744572949016-2024-10-29.jpg,/uploads/1744572952851-483136894_17870962449303054_3135490324679458538_n.jpg', '/uploads/1744572816814-457265649_1232906807724726_1094406509468098766_n.jpg', 'approved', '2025-04-13 19:31:34', 'Food'),
(39, 27, 'Girl\'s Girl', 'Girl\'s Girl is a vibrant, multi-level fashion boutique located in the heart of Kuala Lumpur. Spanning four floors, the store offers a diverse range of styles, from soft pastel coquette to edgy streetwear, catering to various fashion preferences. Their collections include trendy tops, dresses, skirts, and accessories, embracing both feminine and bold aesthetics. The boutique also features menswear and unisex options, ensuring inclusivity for all shoppers. With Instagram-worthy interiors and a curated selection of fashion-forward pieces, Girl\'s Girl provides a unique shopping experience for those looking to express their individuality.', 'Kuala Lumpur', '31, Jalan Tun Tan Cheng Lock, City Centre, 50000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur', 'Instagram: @girlsgirlmy', 'Mon : 10:00 am - 10:00 pm\nTue : 10:00 am - 10:00 pm\nWed : 10:00 am - 10:00 pm\nThu : 10:00 am - 10:00 pm\nFri : 10:00 am - 10:00 pm\nSat : 10:00 am - 10:00 pm\nSun : 10:00 am - 10:00 pm', 'RM49 - RM180', '/uploads/1744573843192-450904892_1684689015613891_3581863193166059048_n.jpg,/uploads/1744573849844-unnamed (5).jpg,/uploads/1744573856450-unnamed (4).jpg', '/uploads/1744573823856-446347665_456364560135609_2753765721746403668_n.jpg', 'approved', '2025-04-13 19:47:14', 'Apparel');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `business_id` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `business_id`, `feedback`, `created_at`) VALUES
(4, 19, 26, 'good', '2025-04-10 01:06:26'),
(6, 21, 26, 'Cute cloths!', '2025-04-09 17:51:43');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `business_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `business_id`, `rating`, `created_at`) VALUES
(15, 19, 26, 3, '2025-04-09 17:20:37'),
(17, 21, 26, 4, '2025-04-09 17:51:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('visitor','owner','admin') DEFAULT 'visitor',
  `profile_photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` bigint(20) DEFAULT NULL,
  `status` enum('Active','Deactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `profile_photo`, `created_at`, `reset_token`, `reset_expires`, `status`) VALUES
(2, 'emi', 'emi@example.com', '$2b$10$FSBCOBJN5A1l6B63ivABruQC19WnDOk41b952T5E57K0we8.eZRaq', 'admin', '/uploads/0942d534d895851717940f2f7f94dc35', '2025-03-30 09:37:55', NULL, NULL, 'Active'),
(16, 'Li Wen', 'helloredbean@outlook.com', '$2y$10$CGUZLB.zhteP5Z9CJedc/.HbqOEB4r2jEOgA/sY3VT4rnw.I8s5iO', 'owner', '/uploads/80aa16e7488b0c89511d89a7878ad5a9', '2025-04-09 00:47:32', NULL, NULL, 'Active'),
(17, 'Goh Han Sheng', 'wulicafeshamelin@gmail.com', '$2y$10$FNgxq4pXpYBmrNUdTazc..IugTpsRkhQHneGMesa/YAern3ssl18G', 'owner', NULL, '2025-04-09 00:47:52', NULL, NULL, 'Active'),
(19, 'Ameylia Syazwani', 'ameylia02@gmail.com', '$2b$10$8otVTvK0DQ3/0VSL5HnSD.4r9qIbQOd6LHkRw/M3DOCRDeIXNdJWS', 'visitor', '/uploads/693360507c7f050c43b2407e3faeb9aa', '2025-04-09 06:13:53', NULL, NULL, 'Active'),
(21, 'Alia Shahira', 'aliashahira02@gmail.com', '$2b$10$6aWVNanionrknwagEBhKp.VsCFeK8UYlBXQGmRFaUZKw9ujJBq3TO', 'visitor', NULL, '2025-04-09 17:51:08', 'fd53d59ef6d3c7eb9f61e6f744125c05d5af27c5c5e321710f7358affd95ac2e', 1744241214504, 'Active'),
(22, 'Najwa Ameylia', 'najwa99@gmail.com', '$2b$10$Lqs4fNYMHdUbfYT2bxgjy.w2xGJNWn9T7Hx0qYwWr7ZsDJJ1NH2EW', 'visitor', '/uploads/71089ac4cf6582c8520529b8565b913d', '2025-04-09 17:54:40', NULL, NULL, 'Active'),
(24, 'Suna Raiki', 'sunaraiki@gmail.com', '$2b$10$V.3.EPM3r6TSe8F40QvKXOY2YEs87EfyMoBFbDaMcol8LuTv2inj2', 'owner', NULL, '2025-04-13 18:47:39', NULL, NULL, 'Active'),
(25, 'Alyssa Lim', 'kookyplate@gmail.com', '$2b$10$1FpM/0w5u7ofqKAtaFfn.uUlmqSX3DIlPcfAMq9EWvc/QDbo60.kG', 'owner', NULL, '2025-04-13 19:11:11', NULL, NULL, 'Active'),
(26, 'Kylie Chan', 'imomentcafe@gmail.com', '$2b$10$NYfDF5kCyWrYpvHxL7vVfek9o2lK6iAgbuivnVOv/NXVaR.TttFla', 'owner', NULL, '2025-04-13 19:27:27', NULL, NULL, 'Active'),
(27, 'Chloe Tan', 'girlsgirlmy@gmail.com', '$2b$10$A/wuJjnsOmAdo9DCvAG3seyVdcorJr7HQa4XwU79GYR0i32.wVns6', 'owner', NULL, '2025-04-13 19:40:49', NULL, NULL, 'Active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_business` (`user_id`,`business_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_business` (`user_id`,`business_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

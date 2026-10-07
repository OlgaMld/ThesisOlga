-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Εξυπηρετητής: 127.0.0.1
-- Χρόνος δημιουργίας: 14 Μάη 2026 στις 13:02:48
-- Έκδοση διακομιστή: 10.4.28-MariaDB
-- Έκδοση PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `dbolga`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `fullname` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `admin`
--

INSERT INTO `admin` (`id`, `email`, `password`, `fullname`) VALUES
(1, 'admin@admin.gr', 'admin123', 'System Admin');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `aggelies`
--

CREATE TABLE `aggelies` (
  `id` int(11) NOT NULL,
  `id_admin` int(11) NOT NULL,
  `title` varchar(400) NOT NULL,
  `description` text NOT NULL,
  `public` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `aggelies`
--

INSERT INTO `aggelies` (`id`, `id_admin`, `title`, `description`, `public`) VALUES
(1, 1, 'Θέση προγραμματιστή REACT', 'Ζητείται Front end , react developer . Επιθυμητό 2 χρόνια εμπειρία, πτυχίο πληροφορικής.', 1),
(2, 1, 'Θέση Λογιστή', 'Ζητείται λογιστής,, πτυχίο Οικονομικών Σπουδών ή λογιστικής, 2 χρόνια προυπηρεσία', 1);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `cv`
--

CREATE TABLE `cv` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `title` varchar(400) NOT NULL,
  `cv_file` varchar(400) NOT NULL,
  `date_upload` datetime NOT NULL DEFAULT current_timestamp(),
  `public` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `cv`
--

INSERT INTO `cv` (`id`, `id_user`, `title`, `cv_file`, `date_upload`, `public`) VALUES
(1, 2, 'mycv', 'uploads/1777292419440-ÎÎ¹Î¿Î³ÏÎ±ÏÎ¹ÎºÏ1.pdf', '2026-04-27 15:20:19', 1),
(2, 3, 'bio2', 'uploads/1777292493990-bio2.pdf', '2026-04-27 15:21:34', 1);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `cv_ggelies`
--

CREATE TABLE `cv_ggelies` (
  `id_cv` int(11) NOT NULL,
  `id_agg` int(11) NOT NULL,
  `api` varchar(400) DEFAULT NULL,
  `response` text DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `grade` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `cv_ggelies`
--

INSERT INTO `cv_ggelies` (`id_cv`, `id_agg`, `api`, `response`, `date`, `grade`) VALUES
(1, 2, 'mock', 'Heuristic fallback scoring. Κοινές λέξεις-κλειδιά: θέση, πτυχίο, οικονομικών, λογιστικής.', '2026-04-27 18:56:59', 40),
(2, 2, 'mock', 'Heuristic fallback scoring. Κοινές λέξεις-κλειδιά: λογιστής, πτυχίο, οικονομικών, χρόνια.', '2026-04-27 18:56:59', 40);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `fullname` varchar(400) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `fullname`) VALUES
(1, 'test1@gmail.com', '$2a$10$2P4v0R/hVdsZ0MM7vQxaK.NLwdnIu9NlLr/Zi8k8zZl2AG5S.voEK', 'test1'),
(2, 'maria@gmail.com', '$2a$10$dg9Wa.gRS.0JOePARoC.HOVQnACGrFaxMyZCCYpDVGr7JMyk0n7cm', 'maria'),
(3, 'nikos@gmail.com', '$2a$10$xz.L2t4ybc39JBiyaYDwVun/CG17kFAdRURRm2ecErC0Fq5bVe4WG', 'nikos');

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Ευρετήρια για πίνακα `aggelies`
--
ALTER TABLE `aggelies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aggelies_admin` (`id_admin`);

--
-- Ευρετήρια για πίνακα `cv`
--
ALTER TABLE `cv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cv_user` (`id_user`);

--
-- Ευρετήρια για πίνακα `cv_ggelies`
--
ALTER TABLE `cv_ggelies`
  ADD PRIMARY KEY (`id_cv`,`id_agg`),
  ADD KEY `fk_cvggelies_agg` (`id_agg`);

--
-- Ευρετήρια για πίνακα `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT για πίνακα `aggelies`
--
ALTER TABLE `aggelies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT για πίνακα `cv`
--
ALTER TABLE `cv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT για πίνακα `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `aggelies`
--
ALTER TABLE `aggelies`
  ADD CONSTRAINT `fk_aggelies_admin` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `cv`
--
ALTER TABLE `cv`
  ADD CONSTRAINT `fk_cv_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `cv_ggelies`
--
ALTER TABLE `cv_ggelies`
  ADD CONSTRAINT `fk_cvggelies_agg` FOREIGN KEY (`id_agg`) REFERENCES `aggelies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cvggelies_cv` FOREIGN KEY (`id_cv`) REFERENCES `cv` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

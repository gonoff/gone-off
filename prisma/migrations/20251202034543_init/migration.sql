-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL,
    `session_token` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_active` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_username_idx`(`username`),
    INDEX `users_session_token_idx`(`session_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_state` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `current_stage` INTEGER NOT NULL DEFAULT 1,
    `highest_stage` INTEGER NOT NULL DEFAULT 1,
    `scrap` BIGINT NOT NULL DEFAULT 0,
    `data_points` BIGINT NOT NULL DEFAULT 0,
    `core_fragments` INTEGER NOT NULL DEFAULT 0,
    `offline_cap_level` INTEGER NOT NULL DEFAULT 1,
    `last_save` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_offline_claim` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `current_boss_hp` BIGINT NOT NULL DEFAULT 100,
    `current_boss_max_hp` BIGINT NOT NULL DEFAULT 100,
    `total_taps` BIGINT NOT NULL DEFAULT 0,
    `total_damage_dealt` BIGINT NOT NULL DEFAULT 0,
    `equipped_weapon_id` INTEGER NULL,
    `equipped_armor_id` INTEGER NULL,

    UNIQUE INDEX `game_state_user_id_key`(`user_id`),
    INDEX `game_state_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('weapon', 'armor', 'accessory', 'consumable') NOT NULL,
    `description` TEXT NULL,
    `damage_bonus` INTEGER NOT NULL DEFAULT 0,
    `crit_chance_bonus` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `crit_damage_bonus` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `scrap_bonus` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `data_bonus` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `unlock_stage` INTEGER NOT NULL DEFAULT 1,
    `cost_scrap` BIGINT NOT NULL DEFAULT 0,
    `cost_data` BIGINT NOT NULL DEFAULT 0,
    `effect_duration` INTEGER NOT NULL DEFAULT 0,
    `effect_value` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `tier` INTEGER NOT NULL DEFAULT 1,

    INDEX `items_type_idx`(`type`),
    INDEX `items_unlock_stage_idx`(`unlock_stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `upgrade_level` INTEGER NOT NULL DEFAULT 0,
    `is_equipped` BOOLEAN NOT NULL DEFAULT false,
    `acquired_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_user_id_idx`(`user_id`),
    INDEX `inventory_user_id_is_equipped_idx`(`user_id`, `is_equipped`),
    UNIQUE INDEX `inventory_user_id_item_id_key`(`user_id`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `machine_type` ENUM('scrap_collector', 'data_miner', 'auto_turret', 'efficiency_bot') NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `last_collected` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `machines_user_id_idx`(`user_id`),
    UNIQUE INDEX `machines_user_id_machine_type_key`(`user_id`, `machine_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `upgrades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `upgrade_type` VARCHAR(30) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `is_permanent` BOOLEAN NOT NULL DEFAULT false,

    INDEX `upgrades_user_id_idx`(`user_id`),
    INDEX `upgrades_user_id_is_permanent_idx`(`user_id`, `is_permanent`),
    UNIQUE INDEX `upgrades_user_id_upgrade_type_key`(`user_id`, `upgrade_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestige_stats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `total_prestiges` INTEGER NOT NULL DEFAULT 0,
    `lifetime_scrap` BIGINT NOT NULL DEFAULT 0,
    `lifetime_data` BIGINT NOT NULL DEFAULT 0,
    `lifetime_core_fragments` INTEGER NOT NULL DEFAULT 0,
    `lifetime_bosses_killed` INTEGER NOT NULL DEFAULT 0,
    `lifetime_taps` BIGINT NOT NULL DEFAULT 0,
    `fastest_stage_100` INTEGER NULL,
    `highest_damage_hit` BIGINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `prestige_stats_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `achievement_key` VARCHAR(50) NOT NULL,
    `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `achievements_user_id_idx`(`user_id`),
    UNIQUE INDEX `achievements_user_id_achievement_key_key`(`user_id`, `achievement_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_state` ADD CONSTRAINT `game_state_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machines` ADD CONSTRAINT `machines_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `upgrades` ADD CONSTRAINT `upgrades_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestige_stats` ADD CONSTRAINT `prestige_stats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
